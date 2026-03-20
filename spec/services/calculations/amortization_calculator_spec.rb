require "rails_helper"

RSpec.describe Calculations::AmortizationCalculator do
  let(:start_date) { Date.new(2025, 1, 1) }

  describe "standard (fully amortizing) loan" do
    subject do
      described_class.call(
        principal: 100_000,
        annual_rate: 12,
        term_months: 12,
        start_date: start_date,
        loan_type: :standard
      )
    end

    it "returns a result with correct structure" do
      expect(subject.monthly_payment).to be_a(BigDecimal)
      expect(subject.total_interest).to be_a(BigDecimal)
      expect(subject.total_cost).to be_a(BigDecimal)
      expect(subject.schedule.length).to eq(12)
    end

    it "calculates correct monthly payment" do
      # 100k at 12% for 12 months ≈ $8884.88
      expect(subject.monthly_payment).to be_within(1).of(8884.88)
    end

    it "ends with zero remaining balance" do
      expect(subject.schedule.last[:remaining_balance]).to eq(BigDecimal("0"))
    end

    it "has total_cost = principal + total_interest" do
      expect(subject.total_cost).to eq(BigDecimal("100000") + subject.total_interest)
    end

    it "schedule months are sequential" do
      subject.schedule.each_with_index do |row, i|
        expect(row[:month]).to eq(i + 1)
      end
    end

    it "due dates advance by one month each" do
      subject.schedule.each_with_index do |row, i|
        expect(row[:due_date]).to eq(start_date >> (i + 1))
      end
    end

    it "principal portions sum to original principal" do
      total_principal = subject.schedule.sum { |row| row[:principal_portion] }
      expect(total_principal).to be_within(BigDecimal("0.01")).of(BigDecimal("100000"))
    end
  end

  describe "zero interest rate" do
    subject do
      described_class.call(
        principal: 12_000,
        annual_rate: 0,
        term_months: 12,
        start_date: start_date,
        loan_type: :standard
      )
    end

    it "divides principal evenly across months" do
      expect(subject.monthly_payment).to eq(BigDecimal("1000"))
    end

    it "has zero total interest" do
      expect(subject.total_interest).to eq(BigDecimal("0"))
    end

    it "all interest portions are zero" do
      subject.schedule.each do |row|
        expect(row[:interest_portion]).to eq(BigDecimal("0"))
      end
    end

    it "ends with zero balance" do
      expect(subject.schedule.last[:remaining_balance]).to eq(BigDecimal("0"))
    end
  end

  describe "single-month term" do
    subject do
      described_class.call(
        principal: 50_000,
        annual_rate: 12,
        term_months: 1,
        start_date: start_date,
        loan_type: :standard
      )
    end

    it "has exactly one schedule entry" do
      expect(subject.schedule.length).to eq(1)
    end

    it "repays entire principal plus one month interest" do
      row = subject.schedule.first
      expected_interest = (BigDecimal("50000") * BigDecimal("0.01")).round(2)
      expect(row[:principal_portion]).to eq(BigDecimal("50000"))
      expect(row[:interest_portion]).to eq(expected_interest)
      expect(row[:remaining_balance]).to eq(BigDecimal("0"))
    end
  end

  describe "interest-only loan" do
    subject do
      described_class.call(
        principal: 100_000,
        annual_rate: 12,
        term_months: 6,
        start_date: start_date,
        loan_type: :interest_only
      )
    end

    it "has interest-only payments for all but last month" do
      subject.schedule[0...-1].each do |row|
        expect(row[:principal_portion]).to eq(BigDecimal("0"))
        expect(row[:interest_portion]).to eq(BigDecimal("1000"))
        expect(row[:remaining_balance]).to eq(BigDecimal("100000"))
      end
    end

    it "last payment includes full principal" do
      last = subject.schedule.last
      expect(last[:principal_portion]).to eq(BigDecimal("100000"))
      expect(last[:remaining_balance]).to eq(BigDecimal("0"))
      expect(last[:payment]).to eq(BigDecimal("101000"))
    end

    it "total interest equals monthly_interest * term" do
      expect(subject.total_interest).to eq(BigDecimal("6000"))
    end
  end

  describe "balloon loan" do
    subject do
      described_class.call(
        principal: 200_000,
        annual_rate: 10,
        term_months: 12,
        start_date: start_date,
        loan_type: :balloon
      )
    end

    it "behaves like interest-only with balloon at end" do
      monthly_interest = (BigDecimal("200000") * BigDecimal("10") / BigDecimal("1200")).round(2)

      subject.schedule[0...-1].each do |row|
        expect(row[:principal_portion]).to eq(BigDecimal("0"))
        expect(row[:interest_portion]).to eq(monthly_interest)
      end

      last = subject.schedule.last
      expect(last[:principal_portion]).to eq(BigDecimal("200000"))
      expect(last[:remaining_balance]).to eq(BigDecimal("0"))
    end
  end

  describe "edge cases" do
    it "returns empty schedule for zero term" do
      result = described_class.call(
        principal: 10_000, annual_rate: 5, term_months: 0,
        start_date: start_date, loan_type: :standard
      )
      expect(result.schedule).to be_empty
      expect(result.monthly_payment).to eq(BigDecimal("0"))
    end

    it "handles very small principal" do
      result = described_class.call(
        principal: 1, annual_rate: 12, term_months: 12,
        start_date: start_date, loan_type: :standard
      )
      expect(result.schedule.last[:remaining_balance]).to eq(BigDecimal("0"))
    end

    it "handles very high interest rate" do
      result = described_class.call(
        principal: 10_000, annual_rate: 100, term_months: 12,
        start_date: start_date, loan_type: :standard
      )
      expect(result.schedule.last[:remaining_balance]).to eq(BigDecimal("0"))
      expect(result.total_interest).to be > BigDecimal("0")
    end

    it "accepts string start_date" do
      result = described_class.call(
        principal: 10_000, annual_rate: 10, term_months: 6,
        start_date: "2025-06-01", loan_type: :standard
      )
      expect(result.schedule.first[:due_date]).to eq(Date.new(2025, 7, 1))
    end

    it "raises on unknown loan type" do
      expect {
        described_class.call(
          principal: 10_000, annual_rate: 10, term_months: 6,
          start_date: start_date, loan_type: :unknown
        )
      }.to raise_error(ArgumentError, /Unknown loan type/)
    end
  end
end
