require "rails_helper"

RSpec.describe Calculations::LoanPricingCalculator do
  describe "low-risk scenario" do
    subject do
      described_class.call(
        ltv: 60,
        term_months: 6,
        property_type: :single_family,
        borrower_experience: :seasoned
      )
    end

    it "suggests base rates minus seasoned discount" do
      expect(subject.suggested_rate_min).to eq(BigDecimal("7.5"))
      expect(subject.suggested_rate_max).to eq(BigDecimal("9.5"))
    end

    it "has no risk factors" do
      expect(subject.risk_factors).to be_empty
    end

    it "has a low risk score" do
      expect(subject.risk_score).to eq(0)
    end
  end

  describe "high-risk scenario" do
    subject do
      described_class.call(
        ltv: 90,
        term_months: 36,
        property_type: :land,
        borrower_experience: :first_time
      )
    end

    it "suggests significantly elevated rates" do
      # Base 8/10 + 3 (LTV) + 1.5 (term) + 3 (land) + 2 (first_time) = 17.5/19.5
      expect(subject.suggested_rate_min).to eq(BigDecimal("17.5"))
      expect(subject.suggested_rate_max).to eq(BigDecimal("19.5"))
    end

    it "lists all risk factors" do
      expect(subject.risk_factors.length).to eq(4)
    end

    it "has a high risk score capped at 100" do
      # 30 + 15 + 25 + 20 = 90
      expect(subject.risk_score).to eq(90)
    end
  end

  describe "moderate-risk scenario" do
    subject do
      described_class.call(
        ltv: 75,
        term_months: 18,
        property_type: :multi_family,
        borrower_experience: :limited
      )
    end

    it "applies moderate adjustments" do
      # Base 8/10 + 1.5 (LTV 70-80) + 0.5 (term 12-24) + 0.5 (multi_family) + 1 (limited) = 11.5/13.5
      expect(subject.suggested_rate_min).to eq(BigDecimal("11.5"))
      expect(subject.suggested_rate_max).to eq(BigDecimal("13.5"))
    end

    it "has 4 risk factors" do
      expect(subject.risk_factors.length).to eq(4)
    end

    it "calculates moderate risk score" do
      # 15 + 5 + 5 + 10 = 35
      expect(subject.risk_score).to eq(35)
    end
  end

  describe "LTV boundary values" do
    it "no adjustment at exactly 65%" do
      result = described_class.call(ltv: 65, term_months: 6, property_type: :single_family, borrower_experience: :experienced)
      expect(result.risk_factors).to be_empty
    end

    it "slight adjustment just above 65%" do
      result = described_class.call(ltv: 66, term_months: 6, property_type: :single_family, borrower_experience: :experienced)
      expect(result.suggested_rate_min).to eq(BigDecimal("8.5"))
    end

    it "moderate adjustment just above 70%" do
      result = described_class.call(ltv: 71, term_months: 6, property_type: :single_family, borrower_experience: :experienced)
      expect(result.suggested_rate_min).to eq(BigDecimal("9.5"))
    end

    it "high adjustment just above 80%" do
      result = described_class.call(ltv: 81, term_months: 6, property_type: :single_family, borrower_experience: :experienced)
      expect(result.suggested_rate_min).to eq(BigDecimal("11"))
    end
  end

  describe "commercial property" do
    it "adds commercial risk adjustment" do
      result = described_class.call(ltv: 60, term_months: 6, property_type: :commercial, borrower_experience: :experienced)
      expect(result.suggested_rate_min).to eq(BigDecimal("9.5"))
      expect(result.risk_factors).to include(match(/Commercial/))
    end
  end
end
