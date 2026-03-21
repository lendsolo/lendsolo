class ExpensesController < ApplicationController
  before_action :set_expense, only: %i[destroy]

  def index
    expenses = current_user.expenses.order(date: :desc)

    # Monthly total
    month_start = Date.current.beginning_of_month
    month_expenses = expenses.where("date >= ?", month_start)

    render inertia: "Expenses/Index", props: {
      expenses: expenses.map { |e| serialize_expense(e) },
      stats: {
        total_all_time: expenses.sum(:amount).to_f,
        total_this_month: month_expenses.sum(:amount).to_f,
        count_this_month: month_expenses.count
      },
      categories: Expense.categories.keys
    }
  end

  def create
    expense = current_user.expenses.build(expense_params)

    if expense.save
      redirect_to expenses_path, notice: "Expense recorded."
    else
      redirect_to expenses_path, alert: expense.errors.full_messages.join(", ")
    end
  end

  def destroy
    @expense.destroy!
    redirect_to expenses_path, notice: "Expense deleted."
  end

  private

  def set_expense
    @expense = current_user.expenses.find(params[:id])
  end

  def expense_params
    params.require(:expense).permit(:description, :amount, :date, :category)
  end

  def serialize_expense(expense)
    {
      id: expense.id,
      description: expense.description,
      amount: expense.amount.to_f,
      date: expense.date.to_s,
      category: expense.category,
      created_at: expense.created_at.iso8601
    }
  end
end
