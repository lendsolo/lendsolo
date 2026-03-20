module Calculations
  class LtvCalculator
    Result = Struct.new(:ratio, :risk_rating, keyword_init: true)

    def self.call(loan_amount:, property_value:)
      new(loan_amount:, property_value:).call
    end

    def initialize(loan_amount:, property_value:)
      @loan_amount = BigDecimal(loan_amount.to_s)
      @property_value = BigDecimal(property_value.to_s)
    end

    def call
      ratio = if @property_value.zero?
        BigDecimal("0")
      else
        (@loan_amount / @property_value * BigDecimal("100")).round(2)
      end

      risk_rating = case ratio
      when 0..BigDecimal("65") then :low
      when BigDecimal("65")..BigDecimal("80") then :medium
      else :high
      end

      Result.new(ratio: ratio, risk_rating: risk_rating)
    end
  end
end
