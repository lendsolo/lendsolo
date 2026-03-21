class Loan < ApplicationRecord
  belongs_to :user
  has_many :payments, dependent: :destroy

  enum :loan_type, { standard: "standard", interest_only: "interest_only", balloon: "balloon" }
  enum :status, { active: "active", paid_off: "paid_off", defaulted: "defaulted", written_off: "written_off" }

  validates :borrower_name, :principal, :annual_rate, :term_months, :start_date, presence: true
  validates :principal, numericality: { greater_than: 0 }
  validates :annual_rate, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
  validates :term_months, numericality: { greater_than: 0, less_than_or_equal_to: 360, only_integer: true }

  # ── Computed fields ────────────────────────────────────────────────────────

  def monthly_payment
    calc = amortization
    calc.monthly_payment.to_f
  end

  def total_interest
    calc = amortization
    calc.total_interest.to_f
  end

  def total_cost
    calc = amortization
    calc.total_cost.to_f
  end

  def remaining_balance
    total_principal_paid = payments.sum(:principal_portion)
    (principal - total_principal_paid).to_f.clamp(0, Float::INFINITY)
  end

  def payments_made_count
    payments.count
  end

  def total_paid
    payments.sum(:amount).to_f
  end

  def interest_earned
    payments.sum(:interest_portion).to_f
  end

  def principal_returned
    payments.sum(:principal_portion).to_f
  end

  def repayment_percentage
    return 0 if principal.zero?
    ((principal_returned / principal.to_f) * 100).clamp(0, 100).round(1)
  end

  def next_payment_due
    return nil unless active?

    paid_count = payments_made_count
    return nil if paid_count >= term_months

    next_month = paid_count + 1
    (start_date >> next_month).to_s
  end

  def days_since_start
    (Date.current - start_date).to_i
  end

  def capital_percentage(total_capital)
    return 0 if total_capital.nil? || total_capital.zero?
    ((principal / total_capital.to_f) * 100).round(1)
  end

  def overdue?
    return false unless active?

    due = next_payment_due_date
    return false if due.nil?

    Date.current > due
  end

  def days_overdue
    return 0 unless overdue?

    due = next_payment_due_date
    (Date.current - due).to_i
  end

  def next_payment_due_date
    return nil unless active?

    paid_count = payments_made_count
    return nil if paid_count >= term_months

    start_date >> (paid_count + 1)
  end

  def expected_next_payment
    return nil unless active?

    schedule = amortization.schedule
    payment_number = payments_made_count + 1
    return nil if payment_number > schedule.length

    row = schedule[payment_number - 1]
    {
      payment_number: payment_number,
      amount: row.payment.to_f,
      principal: row.principal_portion.to_f,
      interest: row.interest_portion.to_f,
      due_date: (start_date >> payment_number).to_s
    }
  end

  # ── Serialization ──────────────────────────────────────────────────────────

  def as_inertia_props(total_capital: nil)
    {
      id: id,
      borrower_name: borrower_name,
      principal: principal.to_f,
      annual_rate: annual_rate.to_f,
      term_months: term_months,
      loan_type: loan_type,
      status: status,
      start_date: start_date.to_s,
      purpose: purpose,
      collateral_description: collateral_description,
      notes: notes,
      created_at: created_at.iso8601,
      # Computed
      monthly_payment: monthly_payment,
      total_interest: total_interest,
      total_cost: total_cost,
      remaining_balance: remaining_balance,
      payments_made_count: payments_made_count,
      total_paid: total_paid,
      interest_earned: interest_earned,
      principal_returned: principal_returned,
      repayment_percentage: repayment_percentage,
      next_payment_due: next_payment_due,
      days_since_start: days_since_start,
      capital_percentage: capital_percentage(total_capital),
      overdue: overdue?,
      days_overdue: days_overdue,
      expected_next_payment: expected_next_payment,
      payments: payments.order(date: :desc).map { |p|
        {
          id: p.id,
          amount: p.amount.to_f,
          date: p.date.to_s,
          principal_portion: p.principal_portion.to_f,
          interest_portion: p.interest_portion.to_f,
          late_fee: p.late_fee.to_f,
          note: p.note
        }
      }
    }
  end

  private

  def amortization
    @amortization ||= Calculations::AmortizationCalculator.call(
      principal: principal,
      annual_rate: annual_rate,
      term_months: term_months,
      start_date: start_date,
      loan_type: loan_type.to_sym
    )
  end
end
