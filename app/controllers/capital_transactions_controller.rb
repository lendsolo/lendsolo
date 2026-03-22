class CapitalTransactionsController < ApplicationController
  def index
    transactions = current_user.capital_transactions.reverse_chronological

    total_infused = current_user.capital_transactions.infusions.sum(:amount).to_f
    total_withdrawn = current_user.capital_transactions.withdrawals.sum(:amount).to_f
    total_adjustments = current_user.capital_transactions.adjustments.sum(:amount).to_f

    year_start = Date.current.beginning_of_year
    year_infusions = current_user.capital_transactions.infusions.where("date >= ?", year_start).sum(:amount).to_f
    year_withdrawals = current_user.capital_transactions.withdrawals.where("date >= ?", year_start).sum(:amount).to_f

    render inertia: "CapitalTransactions/Index", props: {
      transactions: transactions.map { |t| serialize_transaction(t) },
      stats: {
        total_capital: current_user.computed_total_capital,
        total_infused: total_infused,
        total_withdrawn: total_withdrawn,
        total_adjustments: total_adjustments,
        net_change_this_year: year_infusions - year_withdrawals
      }
    }
  end

  def create
    transaction = current_user.capital_transactions.build(transaction_params)

    if transaction.save
      current_user.sync_total_capital!
      redirect_to capital_transactions_path, notice: "Capital transaction recorded."
    else
      redirect_to capital_transactions_path, alert: transaction.errors.full_messages.join(", ")
    end
  end

  def destroy
    transaction = current_user.capital_transactions.find(params[:id])
    transaction.destroy!
    current_user.sync_total_capital!
    redirect_to capital_transactions_path, notice: "Transaction deleted. Capital recalculated."
  end

  private

  def transaction_params
    params.require(:capital_transaction).permit(:transaction_type, :amount, :date, :source, :note)
  end

  def serialize_transaction(txn)
    {
      id: txn.id,
      transaction_type: txn.transaction_type,
      amount: txn.amount.to_f,
      date: txn.date.to_s,
      source: txn.source,
      note: txn.note,
      created_at: txn.created_at.iso8601
    }
  end
end
