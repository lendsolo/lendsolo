module Calculations
  class LoanPricingCalculator
    Result = Struct.new(:suggested_rate_min, :suggested_rate_max, :risk_score, :risk_factors, keyword_init: true)

    BASE_RATE_MIN = BigDecimal("8")
    BASE_RATE_MAX = BigDecimal("10")

    def self.call(ltv:, term_months:, property_type:, borrower_experience:)
      new(ltv:, term_months:, property_type:, borrower_experience:).call
    end

    def initialize(ltv:, term_months:, property_type:, borrower_experience:)
      @ltv = BigDecimal(ltv.to_s)
      @term_months = term_months.to_i
      @property_type = property_type.to_sym
      @borrower_experience = borrower_experience.to_sym
    end

    def call
      adjustments = []
      risk_factors = []
      risk_score = 0

      # LTV risk
      if @ltv > BigDecimal("80")
        adjustments << BigDecimal("3")
        risk_factors << "High LTV (#{@ltv}%) — above 80% threshold"
        risk_score += 30
      elsif @ltv > BigDecimal("70")
        adjustments << BigDecimal("1.5")
        risk_factors << "Moderate LTV (#{@ltv}%) — 70-80% range"
        risk_score += 15
      elsif @ltv > BigDecimal("65")
        adjustments << BigDecimal("0.5")
        risk_factors << "Slightly elevated LTV (#{@ltv}%)"
        risk_score += 5
      end

      # Term risk
      if @term_months > 24
        adjustments << BigDecimal("1.5")
        risk_factors << "Long term (#{@term_months} months) — higher duration risk"
        risk_score += 15
      elsif @term_months > 12
        adjustments << BigDecimal("0.5")
        risk_factors << "Medium term (#{@term_months} months)"
        risk_score += 5
      end

      # Property type risk
      case @property_type
      when :land
        adjustments << BigDecimal("3")
        risk_factors << "Raw land — illiquid collateral, difficult to value"
        risk_score += 25
      when :commercial
        adjustments << BigDecimal("1.5")
        risk_factors << "Commercial property — specialized market"
        risk_score += 15
      when :multi_family
        adjustments << BigDecimal("0.5")
        risk_factors << "Multi-family — moderate complexity"
        risk_score += 5
      when :single_family
        # No adjustment — lowest risk property type
      else
        adjustments << BigDecimal("1")
        risk_factors << "Non-standard property type (#{@property_type})"
        risk_score += 10
      end

      # Borrower experience
      case @borrower_experience
      when :first_time
        adjustments << BigDecimal("2")
        risk_factors << "First-time borrower — no track record"
        risk_score += 20
      when :limited
        adjustments << BigDecimal("1")
        risk_factors << "Limited experience (1-3 deals)"
        risk_score += 10
      when :experienced
        # No adjustment
      when :seasoned
        adjustments << BigDecimal("-0.5")
        risk_score -= 5
      end

      risk_score = [ [ risk_score, 0 ].max, 100 ].min
      total_adjustment = adjustments.sum(BigDecimal("0"))

      Result.new(
        suggested_rate_min: (BASE_RATE_MIN + total_adjustment).round(2),
        suggested_rate_max: (BASE_RATE_MAX + total_adjustment).round(2),
        risk_score: risk_score,
        risk_factors: risk_factors
      )
    end
  end
end
