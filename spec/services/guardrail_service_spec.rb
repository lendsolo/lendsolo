require "rails_helper"

RSpec.describe GuardrailService do
  let(:user) { create(:user, total_capital: 100_000) }

  def build_loan(attrs = {})
    defaults = {
      user: user,
      borrower_name: "Test Borrower",
      principal: 25_000,
      annual_rate: 12,
      term_months: 12,
      loan_type: :standard,
      start_date: 6.months.ago.to_date,
      status: :active,
      collateral_description: "123 Main St"
    }
    build(:loan, defaults.merge(attrs))
  end

  describe "#check_all" do
    it "returns an array of Alert structs" do
      loan = build_loan
      alerts = described_class.new(loan).check_all
      expect(alerts).to be_an(Array)
      alerts.each { |a| expect(a).to be_a(GuardrailService::Alert) }
    end
  end

  describe "concentration alert" do
    it "does not fire when principal is under 30% of total capital" do
      loan = build_loan(principal: 20_000) # 20%
      alerts = described_class.new(loan).check_all
      expect(alerts.none? { |a| a.type == :concentration }).to be true
    end

    it "fires warning at 30% concentration" do
      loan = build_loan(principal: 30_000) # 30%
      alerts = described_class.new(loan).check_all
      alert = alerts.find { |a| a.type == :concentration }
      expect(alert).not_to be_nil
      expect(alert.severity).to eq(:warning)
      expect(alert.message).to include("30.0%")
    end

    it "fires danger at 50% concentration" do
      loan = build_loan(principal: 55_000) # 55%
      alerts = described_class.new(loan).check_all
      alert = alerts.find { |a| a.type == :concentration }
      expect(alert).not_to be_nil
      expect(alert.severity).to eq(:danger)
    end

    it "handles user with zero total_capital" do
      user.update_column(:total_capital, 0)
      loan = build_loan(principal: 25_000)
      alerts = described_class.new(loan).check_all
      expect(alerts.none? { |a| a.type == :concentration }).to be true
    end

    it "handles user with nil total_capital" do
      user.update_column(:total_capital, nil)
      loan = build_loan(principal: 25_000)
      alerts = described_class.new(loan).check_all
      expect(alerts.none? { |a| a.type == :concentration }).to be true
    end

    it "handles loan with zero principal" do
      loan = build_loan(principal: 0)
      loan.define_singleton_method(:valid?) { true } # bypass validation for test
      alerts = described_class.new(loan).check_all
      expect(alerts.none? { |a| a.type == :concentration }).to be true
    end
  end

  describe "collateral alert" do
    it "fires when collateral_description is blank" do
      loan = build_loan(collateral_description: "")
      alerts = described_class.new(loan).check_all
      alert = alerts.find { |a| a.type == :collateral }
      expect(alert).not_to be_nil
      expect(alert.severity).to eq(:warning)
      expect(alert.message).to include("No collateral documented")
    end

    it "fires when collateral_description is nil" do
      loan = build_loan(collateral_description: nil)
      alerts = described_class.new(loan).check_all
      alert = alerts.find { |a| a.type == :collateral }
      expect(alert).not_to be_nil
    end

    it "does not fire when collateral is present" do
      loan = build_loan(collateral_description: "123 Main St, lien position 1")
      alerts = described_class.new(loan).check_all
      expect(alerts.none? { |a| a.type == :collateral }).to be true
    end
  end

  describe "rate reasonableness alert" do
    it "fires info when rate is slightly above range" do
      # Standard loan, 12mo, experienced borrower, 70 LTV → base range ~9.5-11.5
      loan = build_loan(annual_rate: 13, term_months: 12)
      alerts = described_class.new(loan).check_all
      alert = alerts.find { |a| a.type == :rate }
      expect(alert).not_to be_nil
      expect(alert.severity).to eq(:info)
      expect(alert.message).to include("above")
    end

    it "fires warning when rate is more than 3 points above range" do
      loan = build_loan(annual_rate: 20, term_months: 12)
      alerts = described_class.new(loan).check_all
      alert = alerts.find { |a| a.type == :rate }
      expect(alert).not_to be_nil
      expect(alert.severity).to eq(:warning)
    end

    it "fires when rate is below range" do
      loan = build_loan(annual_rate: 3, term_months: 12)
      alerts = described_class.new(loan).check_all
      alert = alerts.find { |a| a.type == :rate }
      expect(alert).not_to be_nil
      expect(alert.message).to include("below")
    end

    it "does not fire when rate is within range" do
      loan = build_loan(annual_rate: 10, term_months: 12)
      alerts = described_class.new(loan).check_all
      expect(alerts.none? { |a| a.type == :rate }).to be true
    end
  end

  describe "maturity alert" do
    it "fires warning when maturity is within 30 days" do
      # Loan that matures in 20 days
      loan = build_loan(
        start_date: (Date.current - 12.months + 20.days),
        term_months: 12
      )
      alerts = described_class.new(loan).check_all
      alert = alerts.find { |a| a.type == :maturity }
      expect(alert).not_to be_nil
      expect(alert.severity).to eq(:warning)
      expect(alert.message).to include("days remaining")
    end

    it "fires danger when maturity is within 7 days" do
      loan = build_loan(
        start_date: (Date.current - 12.months + 5.days),
        term_months: 12
      )
      alerts = described_class.new(loan).check_all
      alert = alerts.find { |a| a.type == :maturity }
      expect(alert).not_to be_nil
      expect(alert.severity).to eq(:danger)
    end

    it "does not fire when maturity is more than 30 days away" do
      loan = build_loan(
        start_date: Date.current - 6.months,
        term_months: 12
      )
      alerts = described_class.new(loan).check_all
      expect(alerts.none? { |a| a.type == :maturity }).to be true
    end

    it "does not fire for non-active loans" do
      loan = build_loan(
        status: :paid_off,
        start_date: (Date.current - 12.months + 5.days),
        term_months: 12
      )
      alerts = described_class.new(loan).check_all
      expect(alerts.none? { |a| a.type == :maturity }).to be true
    end

    it "handles loan with no start_date" do
      loan = build_loan
      allow(loan).to receive(:start_date).and_return(nil)
      alerts = described_class.new(loan).check_all
      expect(alerts.none? { |a| a.type == :maturity }).to be true
    end
  end

  describe "no payments alert" do
    it "fires when active loan has zero payments and is > 35 days old" do
      loan = build_loan(start_date: 40.days.ago.to_date)
      allow(loan).to receive(:payments_made_count).and_return(0)
      alerts = described_class.new(loan).check_all
      alert = alerts.find { |a| a.type == :no_payments }
      expect(alert).not_to be_nil
      expect(alert.severity).to eq(:warning)
      expect(alert.message).to include("40 days ago")
    end

    it "does not fire when loan is less than 35 days old" do
      loan = build_loan(start_date: 30.days.ago.to_date)
      allow(loan).to receive(:payments_made_count).and_return(0)
      alerts = described_class.new(loan).check_all
      expect(alerts.none? { |a| a.type == :no_payments }).to be true
    end

    it "does not fire when payments exist" do
      loan = build_loan(start_date: 60.days.ago.to_date)
      allow(loan).to receive(:payments_made_count).and_return(1)
      alerts = described_class.new(loan).check_all
      expect(alerts.none? { |a| a.type == :no_payments }).to be true
    end

    it "does not fire for non-active loans" do
      loan = build_loan(status: :paid_off, start_date: 60.days.ago.to_date)
      allow(loan).to receive(:payments_made_count).and_return(0)
      alerts = described_class.new(loan).check_all
      expect(alerts.none? { |a| a.type == :no_payments }).to be true
    end
  end

  describe "multiple alerts simultaneously" do
    it "returns multiple alerts for a risky loan" do
      loan = build_loan(
        principal: 60_000,            # 60% concentration → danger
        collateral_description: nil,   # missing collateral → warning
        annual_rate: 25,               # way above range → warning
        start_date: 50.days.ago.to_date
      )
      allow(loan).to receive(:payments_made_count).and_return(0)

      alerts = described_class.new(loan).check_all
      types = alerts.map(&:type)

      expect(types).to include(:concentration)
      expect(types).to include(:collateral)
      expect(types).to include(:rate)
      expect(types).to include(:no_payments)
      expect(alerts.length).to be >= 4
    end
  end

  describe ".check_portfolio" do
    it "returns alert hashes with loan_id and borrower_name" do
      loan = create(:loan,
        user: user,
        borrower_name: "Jane Doe",
        principal: 50_000,
        annual_rate: 12,
        term_months: 12,
        start_date: 6.months.ago.to_date,
        status: :active,
        collateral_description: nil
      )

      results = described_class.check_portfolio(user)
      expect(results).to be_an(Array)
      expect(results.first).to include(:type, :severity, :message, :loan_id, :borrower_name)
      expect(results.first[:loan_id]).to eq(loan.id)
      expect(results.first[:borrower_name]).to eq("Jane Doe")
    end
  end
end
