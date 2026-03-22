require "rails_helper"

RSpec.describe Payment, type: :model do
  describe "associations" do
    it "belongs to loan" do
      expect(build(:payment)).to respond_to(:loan)
    end
  end

  describe "validations" do
    it "requires amount > 0" do
      payment = build(:payment, amount: 0)
      expect(payment).not_to be_valid
    end

    it "requires date" do
      payment = build(:payment, date: nil)
      expect(payment).not_to be_valid
    end

    it "rejects negative late_fee" do
      loan = create(:loan)
      payment = loan.payments.build(amount: 100, date: Date.current, late_fee: -5)
      expect(payment).not_to be_valid
    end
  end

  describe "auto-split calculation" do
    let(:loan) { create(:loan, principal: 100_000, annual_rate: 12, term_months: 12, start_date: Date.new(2025, 1, 1)) }

    it "auto-calculates principal and interest portions on create" do
      payment = loan.payments.create!(amount: loan.monthly_payment, date: Date.new(2025, 2, 1))
      expect(payment.principal_portion).to be > 0
      expect(payment.interest_portion).to be > 0
      expect(payment.principal_portion + payment.interest_portion).to be_within(0.01).of(payment.amount)
    end

    it "assigns interest first for partial payments" do
      schedule = Calculations::AmortizationCalculator.call(
        principal: 100_000, annual_rate: 12, term_months: 12,
        start_date: Date.new(2025, 1, 1), loan_type: :standard
      ).schedule
      expected_interest = schedule[0][:interest_portion].to_f

      # Pay less than the interest portion
      small_amount = expected_interest / 2
      payment = loan.payments.create!(amount: small_amount, date: Date.new(2025, 2, 1))
      expect(payment.interest_portion.to_f).to be_within(0.01).of(small_amount)
      expect(payment.principal_portion.to_f).to eq(0)
    end

    it "assigns extra to principal for overpayments" do
      payment = loan.payments.create!(amount: 15_000, date: Date.new(2025, 2, 1))
      expect(payment.principal_portion.to_f).to be > 0
      expect(payment.interest_portion.to_f).to be > 0
      expect(payment.principal_portion + payment.interest_portion).to be_within(0.01).of(15_000)
    end

    it "assigns all to principal beyond schedule" do
      # Create all scheduled payments first
      12.times do |i|
        loan.payments.create!(amount: loan.monthly_payment, date: Date.new(2025, 2, 1) + i.months)
      end
      # Payment beyond schedule
      extra = loan.payments.create!(amount: 500, date: Date.new(2026, 3, 1))
      expect(extra.interest_portion.to_f).to eq(0)
      expect(extra.principal_portion.to_f).to eq(500)
    end

    it "sets late_fee to 0 by default" do
      payment = loan.payments.create!(amount: 1000, date: Date.current)
      expect(payment.late_fee).to eq(0)
    end
  end

  describe "loan payoff callback" do
    it "marks loan as paid_off after final payment" do
      loan = create(:loan, principal: 12_000, annual_rate: 0, term_months: 3, start_date: Date.new(2025, 1, 1))
      3.times do |i|
        loan.payments.create!(amount: 4000, date: Date.new(2025, 2, 1) + i.months)
      end
      expect(loan.reload.status).to eq("paid_off")
    end

    it "does not mark as paid_off before all payments made" do
      loan = create(:loan, principal: 12_000, annual_rate: 0, term_months: 3, start_date: Date.new(2025, 1, 1))
      loan.payments.create!(amount: 4000, date: Date.new(2025, 2, 1))
      expect(loan.reload.status).to eq("active")
    end
  end
end
