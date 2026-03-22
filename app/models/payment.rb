class Payment < ApplicationRecord
  belongs_to :loan

  validates :amount, :date, presence: true
  validates :amount, numericality: { greater_than: 0 }
  validates :principal_portion, :interest_portion, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :late_fee, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  before_validation :calculate_split, on: :create

  after_create :check_loan_payoff
  after_commit :refresh_loan_payment_cache

  private

  # Auto-calculate principal/interest split based on amortization schedule position
  def calculate_split
    return if loan.nil? || amount.nil? || amount <= 0

    schedule = loan_amortization_schedule
    payment_number = loan.payments.count + 1  # +1 because this payment isn't saved yet

    if payment_number <= schedule.length
      expected = schedule[payment_number - 1]
      expected_interest = BigDecimal(expected[:interest_portion].to_s)
      expected_principal = BigDecimal(expected[:principal_portion].to_s)
      payment_amount = BigDecimal(amount.to_s)

      if payment_amount >= expected_interest + expected_principal
        # Full or overpayment: cover scheduled split, extra goes to principal
        self.interest_portion = expected_interest
        self.principal_portion = payment_amount - expected_interest
      else
        # Partial payment: interest first, remainder to principal
        if payment_amount <= expected_interest
          self.interest_portion = payment_amount
          self.principal_portion = 0
        else
          self.interest_portion = expected_interest
          self.principal_portion = payment_amount - expected_interest
        end
      end
    else
      # Beyond scheduled payments — all goes to principal
      self.interest_portion = 0
      self.principal_portion = BigDecimal(amount.to_s)
    end

    self.late_fee ||= 0
  end

  def check_loan_payoff
    # If this is the final scheduled payment, auto-mark loan as paid off
    if loan.payments.count >= loan.term_months && loan.active?
      loan.update!(status: :paid_off)
    end
  end

  def refresh_loan_payment_cache
    return if loan.destroyed?
    loan.refresh_payment_cache!
  end

  def loan_amortization_schedule
    Calculations::AmortizationCalculator.call(
      principal: loan.principal,
      annual_rate: loan.annual_rate,
      term_months: loan.term_months,
      start_date: loan.start_date,
      loan_type: loan.loan_type.to_sym
    ).schedule
  end
end
