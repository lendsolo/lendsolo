module Calculations
  class RoiCalculator
    Result = Struct.new(:net_profit, :roi_percent, :annualized_roi, :cash_on_cash_return, keyword_init: true)

    def self.call(purchase_price:, rehab_cost:, holding_costs:, sale_price:, loan_amount:, loan_rate:, hold_months:)
      new(
        purchase_price:, rehab_cost:, holding_costs:, sale_price:,
        loan_amount:, loan_rate:, hold_months:
      ).call
    end

    def initialize(purchase_price:, rehab_cost:, holding_costs:, sale_price:, loan_amount:, loan_rate:, hold_months:)
      @purchase_price = BigDecimal(purchase_price.to_s)
      @rehab_cost = BigDecimal(rehab_cost.to_s)
      @holding_costs = BigDecimal(holding_costs.to_s)
      @sale_price = BigDecimal(sale_price.to_s)
      @loan_amount = BigDecimal(loan_amount.to_s)
      @loan_rate = BigDecimal(loan_rate.to_s)
      @hold_months = hold_months.to_i
    end

    def call
      total_investment = @purchase_price + @rehab_cost + @holding_costs
      cash_invested = total_investment - @loan_amount
      interest_cost = (@loan_amount * @loan_rate / BigDecimal("100") * @hold_months / BigDecimal("12")).round(2)
      total_costs = total_investment + interest_cost
      net_profit = (@sale_price - total_costs).round(2)

      # ROI = net_profit / total_investment
      roi_percent = if total_investment.zero?
        BigDecimal("0")
      else
        (net_profit / total_investment * BigDecimal("100")).round(2)
      end

      # Annualized ROI
      annualized_roi = if @hold_months.zero? || total_investment.zero?
        BigDecimal("0")
      else
        (roi_percent * BigDecimal("12") / @hold_months).round(2)
      end

      # Cash-on-cash return = net_profit / cash_invested
      cash_on_cash_return = if cash_invested.zero?
        BigDecimal("0")
      else
        (net_profit / cash_invested * BigDecimal("100")).round(2)
      end

      Result.new(
        net_profit: net_profit,
        roi_percent: roi_percent,
        annualized_roi: annualized_roi,
        cash_on_cash_return: cash_on_cash_return
      )
    end
  end
end
