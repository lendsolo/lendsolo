class Loan < ApplicationRecord
  belongs_to :user
  belongs_to :borrower, optional: true
  has_many :payments, dependent: :destroy

  enum :loan_type, { standard: "standard", interest_only: "interest_only", balloon: "balloon" }
  enum :status, { active: "active", paid_off: "paid_off", defaulted: "defaulted", written_off: "written_off" }

  validates :borrower_name, :principal, :annual_rate, :term_months, :start_date, presence: true
  validates :principal, numericality: { greater_than: 0 }
  validates :annual_rate, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
  validates :term_months, numericality: { greater_than: 0, less_than_or_equal_to: 360, only_integer: true }

  after_commit :refresh_payment_cache!, on: [:create, :update]

  # ── Payment cache ───────────────────────────────────────────────────────

  def refresh_payment_cache!
    next_pmt = expected_next_payment
    update_columns(
      cached_next_payment_date: next_pmt ? Date.parse(next_pmt[:due_date]) : nil,
      cached_next_payment_amount: next_pmt ? next_pmt[:amount] : nil
    )
  end

  # ── Borrower helpers ──────────────────────────────────────────────────────

  def display_borrower_name
    borrower&.name || borrower_name
  end

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
      amount: row[:payment].to_f,
      principal: row[:principal_portion].to_f,
      interest: row[:interest_portion].to_f,
      due_date: (start_date >> payment_number).to_s
    }
  end

  # ── Batch preloading for index pages ──────────────────────────────────────

  def self.preload_payment_stats(loans)
    loan_ids = loans.map(&:id)
    return {} if loan_ids.empty?

    stats = Payment.where(loan_id: loan_ids)
      .group(:loan_id)
      .select(
        :loan_id,
        "SUM(amount) as total_amount",
        "SUM(principal_portion) as total_principal",
        "SUM(interest_portion) as total_interest",
        "COUNT(*) as payment_count",
        "MAX(date) as last_payment_date"
      ).index_by(&:loan_id)

    # Preload most recent payment per loan using a lateral join approach
    recent_payments = Payment.where(loan_id: loan_ids)
      .order(:loan_id, date: :desc, id: :desc)
      .select(:loan_id, :id, :amount, :date, :principal_portion, :interest_portion, :late_fee, :note)
      .group_by(&:loan_id)

    { stats: stats, recent_payments: recent_payments }
  end

  # ── Serialization ──────────────────────────────────────────────────────────

  def as_inertia_props(total_capital: nil, preloaded: nil)
    stats = preloaded&.dig(:stats, id)
    recent = preloaded&.dig(:recent_payments, id)

    p_count = stats ? stats.payment_count.to_i : payments_made_count
    p_total = stats ? stats.total_amount.to_f : total_paid
    p_interest = stats ? stats.total_interest.to_f : interest_earned
    p_principal = stats ? stats.total_principal.to_f : principal_returned
    p_remaining = (principal - p_principal).to_f.clamp(0, Float::INFINITY)
    p_repayment = principal.zero? ? 0 : ((p_principal / principal.to_f) * 100).clamp(0, 100).round(1)

    # Use preloaded count to avoid N+1 on next_payment_due, overdue, etc.
    np_due = next_payment_due_with_count(p_count)
    np_due_date = next_payment_due_date_with_count(p_count)
    is_overdue = active? && np_due_date && Date.current > np_due_date
    d_overdue = is_overdue ? (Date.current - np_due_date).to_i : 0
    exp_next = expected_next_payment_with_count(p_count)

    payment_list = if recent
      recent.map { |p| serialize_payment(p) }
    else
      payments.order(date: :desc).map { |p| serialize_payment(p) }
    end

    {
      id: id,
      borrower_id: borrower_id,
      borrower_name: display_borrower_name,
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
      remaining_balance: p_remaining,
      payments_made_count: p_count,
      total_paid: p_total,
      interest_earned: p_interest,
      principal_returned: p_principal,
      repayment_percentage: p_repayment,
      next_payment_due: np_due,
      days_since_start: days_since_start,
      capital_percentage: capital_percentage(total_capital),
      overdue: is_overdue,
      days_overdue: d_overdue,
      expected_next_payment: exp_next,
      payments: payment_list
    }
  end

  def next_payment_due_with_count(paid_count)
    return nil unless active?
    return nil if paid_count >= term_months
    (start_date >> (paid_count + 1)).to_s
  end

  def next_payment_due_date_with_count(paid_count)
    return nil unless active?
    return nil if paid_count >= term_months
    start_date >> (paid_count + 1)
  end

  def expected_next_payment_with_count(paid_count)
    return nil unless active?
    payment_number = paid_count + 1
    schedule = amortization.schedule
    return nil if payment_number > schedule.length

    row = schedule[payment_number - 1]
    {
      payment_number: payment_number,
      amount: row[:payment].to_f,
      principal: row[:principal_portion].to_f,
      interest: row[:interest_portion].to_f,
      due_date: (start_date >> payment_number).to_s
    }
  end

  def serialize_payment(p)
    {
      id: p.id,
      amount: p.amount.to_f,
      date: p.date.to_s,
      principal_portion: p.principal_portion.to_f,
      interest_portion: p.interest_portion.to_f,
      late_fee: p.late_fee.to_f,
      note: p.note
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
