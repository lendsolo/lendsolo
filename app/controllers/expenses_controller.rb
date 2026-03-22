class ExpensesController < ApplicationController
  before_action :set_expense, only: %i[destroy stop_recurring resume_recurring]
  before_action :enforce_pro_gate!, only: :export_csv

  def index
    expenses = current_user.expenses.where(recurring_parent_id: nil).or(
      current_user.expenses.where.not(recurring_parent_id: nil)
    ).order(date: :desc)

    # Monthly total
    month_start = Date.current.beginning_of_month
    month_expenses = current_user.expenses.where("date >= ?", month_start)

    # Recurring monthly burn rate
    active_recurring = current_user.expenses.active_recurring
    recurring_monthly = active_recurring.sum do |e|
      case e.frequency
      when "monthly" then e.amount.to_f
      when "quarterly" then e.amount.to_f / 3.0
      when "annually" then e.amount.to_f / 12.0
      else 0
      end
    end

    render inertia: "Expenses/Index", props: {
      expenses: expenses.map { |e| serialize_expense(e) },
      stats: {
        total_all_time: current_user.expenses.sum(:amount).to_f,
        total_this_month: month_expenses.sum(:amount).to_f,
        count_this_month: month_expenses.count,
        recurring_monthly: recurring_monthly.round(2)
      },
      categories: Expense.categories.keys,
      can_export_csv: pro_or_above?
    }
  end

  def export_csv
    expenses = current_user.expenses.order(date: :desc)

    csv = generate_expenses_csv(expenses)

    send_data csv,
              filename: "lendsolo_expenses_#{Time.current.strftime('%Y%m%d%H%M%S')}.csv",
              type: "text/csv",
              disposition: "attachment"
  end

  def create
    expense = current_user.expenses.build(expense_params)

    if expense.recurring? && expense.frequency.present? && expense.date.present?
      expense.next_occurrence_date = calculate_next_occurrence(expense.date, expense.frequency)
    end

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

  def stop_recurring
    @expense.stop_recurring!
    redirect_to expenses_path, notice: "Recurring expense stopped."
  end

  def resume_recurring
    @expense.resume_recurring!
    redirect_to expenses_path, notice: "Recurring expense resumed."
  end

  private

  def set_expense
    @expense = current_user.expenses.find(params[:id])
  end

  def expense_params
    params.require(:expense).permit(:description, :amount, :date, :category, :recurring, :frequency)
  end

  def calculate_next_occurrence(date, frequency)
    case frequency
    when "monthly" then date + 1.month
    when "quarterly" then date + 3.months
    when "annually" then date + 1.year
    end
  end

  def generate_expenses_csv(expenses)
    require "csv"
    CSV.generate do |csv|
      csv << %w[date description category amount]

      expenses.each do |e|
        csv << [e.date.to_s, e.description, e.category, e.amount.to_f]
      end
    end
  end

  def serialize_expense(expense)
    {
      id: expense.id,
      description: expense.description,
      amount: expense.amount.to_f,
      date: expense.date.to_s,
      category: expense.category,
      created_at: expense.created_at.iso8601,
      recurring: expense.recurring?,
      frequency: expense.frequency,
      next_occurrence_date: expense.next_occurrence_date&.to_s,
      recurring_parent_id: expense.recurring_parent_id,
      active: expense.active?,
      parent_description: expense.recurring_parent&.description
    }
  end
end
