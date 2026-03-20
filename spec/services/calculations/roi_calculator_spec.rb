require "rails_helper"

RSpec.describe Calculations::RoiCalculator do
  describe "profitable flip" do
    subject do
      described_class.call(
        purchase_price: 150_000,
        rehab_cost: 30_000,
        holding_costs: 5_000,
        sale_price: 250_000,
        loan_amount: 120_000,
        loan_rate: 12,
        hold_months: 6
      )
    end

    it "calculates net profit after interest" do
      # Total investment: 185,000
      # Interest: 120,000 * 12% * 6/12 = 7,200
      # Total costs: 192,200
      # Net profit: 250,000 - 192,200 = 57,800
      expect(subject.net_profit).to eq(BigDecimal("57800"))
    end

    it "calculates ROI percent" do
      # 57,800 / 185,000 * 100 = 31.24%
      expect(subject.roi_percent).to eq(BigDecimal("31.24"))
    end

    it "calculates annualized ROI" do
      # 31.24 * 12 / 6 ≈ 62.48%
      expect(subject.annualized_roi).to eq(BigDecimal("62.48"))
    end

    it "calculates cash-on-cash return" do
      # Cash invested: 185,000 - 120,000 = 65,000
      # 57,800 / 65,000 * 100 = 88.92%
      expect(subject.cash_on_cash_return).to eq(BigDecimal("88.92"))
    end
  end

  describe "losing deal" do
    subject do
      described_class.call(
        purchase_price: 200_000,
        rehab_cost: 50_000,
        holding_costs: 10_000,
        sale_price: 220_000,
        loan_amount: 160_000,
        loan_rate: 15,
        hold_months: 12
      )
    end

    it "returns negative profit" do
      # Total investment: 260,000
      # Interest: 160,000 * 15% * 1 = 24,000
      # Total costs: 284,000
      # Net: 220,000 - 284,000 = -64,000
      expect(subject.net_profit).to eq(BigDecimal("-64000"))
    end

    it "returns negative ROI" do
      expect(subject.roi_percent).to be < 0
    end
  end

  describe "edge cases" do
    it "handles zero loan amount (all cash deal)" do
      result = described_class.call(
        purchase_price: 100_000, rehab_cost: 0, holding_costs: 0,
        sale_price: 120_000, loan_amount: 0, loan_rate: 0, hold_months: 6
      )
      expect(result.net_profit).to eq(BigDecimal("20000"))
      expect(result.cash_on_cash_return).to eq(BigDecimal("20"))
    end

    it "handles zero hold months" do
      result = described_class.call(
        purchase_price: 100_000, rehab_cost: 0, holding_costs: 0,
        sale_price: 110_000, loan_amount: 80_000, loan_rate: 12, hold_months: 0
      )
      expect(result.net_profit).to eq(BigDecimal("10000"))
      expect(result.annualized_roi).to eq(BigDecimal("0"))
    end

    it "handles fully financed deal (cash invested = 0)" do
      result = described_class.call(
        purchase_price: 100_000, rehab_cost: 0, holding_costs: 0,
        sale_price: 120_000, loan_amount: 100_000, loan_rate: 10, hold_months: 6
      )
      expect(result.cash_on_cash_return).to eq(BigDecimal("0"))
    end
  end
end
