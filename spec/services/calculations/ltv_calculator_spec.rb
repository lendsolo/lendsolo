require "rails_helper"

RSpec.describe Calculations::LtvCalculator do
  describe "risk ratings" do
    it "rates low risk for LTV <= 65%" do
      result = described_class.call(loan_amount: 65_000, property_value: 100_000)
      expect(result.ratio).to eq(BigDecimal("65"))
      expect(result.risk_rating).to eq(:low)
    end

    it "rates medium risk for LTV 65-80%" do
      result = described_class.call(loan_amount: 75_000, property_value: 100_000)
      expect(result.ratio).to eq(BigDecimal("75"))
      expect(result.risk_rating).to eq(:medium)
    end

    it "rates high risk for LTV > 80%" do
      result = described_class.call(loan_amount: 85_000, property_value: 100_000)
      expect(result.ratio).to eq(BigDecimal("85"))
      expect(result.risk_rating).to eq(:high)
    end

    it "rates 80% as medium" do
      result = described_class.call(loan_amount: 80_000, property_value: 100_000)
      expect(result.ratio).to eq(BigDecimal("80"))
      expect(result.risk_rating).to eq(:medium)
    end
  end

  describe "edge cases" do
    it "handles zero property value" do
      result = described_class.call(loan_amount: 50_000, property_value: 0)
      expect(result.ratio).to eq(BigDecimal("0"))
    end

    it "handles zero loan amount" do
      result = described_class.call(loan_amount: 0, property_value: 100_000)
      expect(result.ratio).to eq(BigDecimal("0"))
      expect(result.risk_rating).to eq(:low)
    end

    it "handles LTV over 100%" do
      result = described_class.call(loan_amount: 120_000, property_value: 100_000)
      expect(result.ratio).to eq(BigDecimal("120"))
      expect(result.risk_rating).to eq(:high)
    end

    it "returns precise decimal ratio" do
      result = described_class.call(loan_amount: 70_000, property_value: 300_000)
      expect(result.ratio).to eq(BigDecimal("23.33"))
    end
  end
end
