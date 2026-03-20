module Calculations
  class AmortizationCalculator
    Result = Struct.new(:monthly_payment, :total_interest, :total_cost, :schedule, keyword_init: true)

    def self.call(principal:, annual_rate:, term_months:, start_date:, loan_type: :standard)
      new(principal:, annual_rate:, term_months:, start_date:, loan_type:).call
    end

    def initialize(principal:, annual_rate:, term_months:, start_date:, loan_type:)
      @principal = BigDecimal(principal.to_s)
      @annual_rate = BigDecimal(annual_rate.to_s)
      @term_months = term_months.to_i
      @start_date = start_date.is_a?(String) ? Date.parse(start_date) : start_date
      @loan_type = loan_type.to_sym
    end

    def call
      schedule = build_schedule
      total_interest = schedule.sum { |row| row[:interest_portion] }
      total_cost = @principal + total_interest

      Result.new(
        monthly_payment: schedule.first&.dig(:payment) || BigDecimal("0"),
        total_interest: total_interest,
        total_cost: total_cost,
        schedule: schedule
      )
    end

    private

    def build_schedule
      return [] if @term_months <= 0

      case @loan_type
      when :standard then standard_schedule
      when :interest_only then interest_only_schedule
      when :balloon then balloon_schedule
      else raise ArgumentError, "Unknown loan type: #{@loan_type}"
      end
    end

    def monthly_rate
      @monthly_rate ||= @annual_rate / BigDecimal("1200")
    end

    def standard_monthly_payment
      return @principal / @term_months if monthly_rate.zero?

      # M = P * [r(1+r)^n] / [(1+r)^n - 1]
      r = monthly_rate
      n = @term_months
      factor = (BigDecimal("1") + r)**n
      (@principal * r * factor / (factor - BigDecimal("1"))).round(2)
    end

    def interest_only_payment
      (@principal * monthly_rate).round(2)
    end

    def standard_schedule
      payment = standard_monthly_payment
      balance = @principal
      schedule = []

      @term_months.times do |i|
        interest = (balance * monthly_rate).round(2)
        # Last month: adjust to pay off exact remaining balance
        if i == @term_months - 1
          principal_portion = balance
          payment = principal_portion + interest
        else
          principal_portion = payment - interest
          # Guard against negative principal from rounding
          principal_portion = BigDecimal("0") if principal_portion.negative?
        end
        balance -= principal_portion
        balance = BigDecimal("0") if balance.negative?

        schedule << {
          month: i + 1,
          due_date: @start_date >> (i + 1),
          payment: payment,
          principal_portion: principal_portion,
          interest_portion: interest,
          remaining_balance: balance.round(2)
        }
      end

      schedule
    end

    def interest_only_schedule
      payment = interest_only_payment
      schedule = []

      @term_months.times do |i|
        interest = payment
        if i == @term_months - 1
          # Final payment includes full principal
          principal_portion = @principal
          final_payment = @principal + interest
          schedule << {
            month: i + 1,
            due_date: @start_date >> (i + 1),
            payment: final_payment,
            principal_portion: principal_portion,
            interest_portion: interest,
            remaining_balance: BigDecimal("0")
          }
        else
          schedule << {
            month: i + 1,
            due_date: @start_date >> (i + 1),
            payment: payment,
            principal_portion: BigDecimal("0"),
            interest_portion: interest,
            remaining_balance: @principal
          }
        end
      end

      schedule
    end

    def balloon_schedule
      # Same as interest_only: interest payments throughout, principal due at end
      interest_only_schedule
    end
  end
end
