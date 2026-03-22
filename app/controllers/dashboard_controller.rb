class DashboardController < ApplicationController
  def index
    loans = current_user.loans.includes(:payments)
    active_loans = loans.where(status: :active)
    all_payments = Payment.joins(:loan).where(loans: { user_id: current_user.id })
    all_expenses = current_user.expenses

    total_deployed = active_loans.sum(:principal).to_f
    total_capital = (current_user.total_capital || 0).to_f
    available_capital = [total_capital - total_deployed, 0].max
    total_interest_earned = all_payments.sum(:interest_portion).to_f
    total_expenses_amount = all_expenses.sum(:amount).to_f
    net_profit = total_interest_earned - total_expenses_amount
    roi = total_deployed > 0 ? ((total_interest_earned / total_deployed) * 100).round(2) : 0.0

    # Weighted average rate across active loans
    weighted_sum = active_loans.sum("principal * annual_rate").to_f
    avg_rate = total_deployed > 0 ? (weighted_sum / total_deployed).round(2) : 0.0

    # Monthly interest data — last 6 months
    monthly_interest_data = (0..5).map do |months_ago|
      month_start = months_ago.months.ago.beginning_of_month.to_date
      month_end = month_start.end_of_month

      month_payments = all_payments.where(payments: { date: month_start..month_end })

      {
        month: month_start.strftime("%b %Y"),
        interest: month_payments.sum(:interest_portion).to_f,
        principal: month_payments.sum(:principal_portion).to_f
      }
    end.reverse

    # Upcoming payments — next 5 expected from active loans
    upcoming_payments = active_loans.filter_map do |loan|
      next_payment = loan.expected_next_payment
      next unless next_payment

      {
        loan_id: loan.id,
        borrower_id: loan.borrower_id,
        borrower_name: loan.display_borrower_name,
        amount: next_payment[:amount],
        due_date: next_payment[:due_date],
        overdue: loan.overdue?,
        days_overdue: loan.days_overdue
      }
    end.sort_by { |p| p[:due_date] }.first(5)

    # Portfolio allocation — each active loan's share
    portfolio_allocation = active_loans.order(principal: :desc).map do |loan|
      {
        id: loan.id,
        borrower_id: loan.borrower_id,
        borrower_name: loan.display_borrower_name,
        principal: loan.principal.to_f,
        percentage: total_deployed > 0 ? ((loan.principal.to_f / total_deployed) * 100).round(1) : 0
      }
    end

    render inertia: "Dashboard/Index", props: {
      stats: {
        active_loans: active_loans.count,
        total_deployed: total_deployed,
        available_capital: available_capital,
        total_capital: total_capital,
        total_interest_earned: total_interest_earned,
        total_expenses: total_expenses_amount,
        net_profit: net_profit,
        roi: roi,
        avg_rate: avg_rate,
        total_loans: loans.count,
        paid_off_loans: loans.where(status: :paid_off).count,
        defaulted_loans: loans.where(status: :defaulted).count
      },
      monthly_interest_data: monthly_interest_data,
      upcoming_payments: upcoming_payments,
      portfolio_allocation: portfolio_allocation
    }
  end
end
