class DashboardController < ApplicationController
  def index
    loans = current_user.loans.includes(:payments)
    active_loans = loans.where(status: :active)
    all_payments = Payment.joins(:loan).where(loans: { user_id: current_user.id })
    all_expenses = current_user.expenses

    total_deployed = active_loans.sum(:principal).to_f
    total_capital = current_user.computed_total_capital
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

    # Upcoming payments — next 5 expected from active loans (uses cached fields)
    upcoming_payments = active_loans.filter_map do |loan|
      if loan.cached_next_payment_date.present?
        due_date = loan.cached_next_payment_date
        amount = loan.cached_next_payment_amount.to_f
      else
        # Fallback for loans without cached values; populate the cache
        next_payment = loan.expected_next_payment
        next unless next_payment
        loan.refresh_payment_cache!
        due_date = Date.parse(next_payment[:due_date])
        amount = next_payment[:amount]
      end

      is_overdue = Date.current > due_date
      {
        loan_id: loan.id,
        borrower_id: loan.borrower_id,
        borrower_name: loan.display_borrower_name,
        amount: amount,
        due_date: due_date.to_s,
        overdue: is_overdue,
        days_overdue: is_overdue ? (Date.current - due_date).to_i : 0
      }
    end.sort_by { |p| p[:due_date] }.first(5)

    # Preload payment stats for portfolio allocation serialization
    preloaded = Loan.preload_payment_stats(active_loans)

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

    recent_capital_transactions = current_user.capital_transactions
      .reverse_chronological.limit(3).map do |t|
      {
        id: t.id,
        transaction_type: t.transaction_type,
        amount: t.amount.to_f,
        date: t.date.to_s,
        source: t.source
      }
    end

    render inertia: "Dashboard/Index", props: {
      recent_capital_transactions: recent_capital_transactions,
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
