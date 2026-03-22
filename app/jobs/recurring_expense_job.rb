class RecurringExpenseJob < ApplicationJob
  queue_as :default

  def perform
    Expense.active_recurring.where("next_occurrence_date <= ?", Date.current).find_each do |expense|
      # Generate all missed entries (catch-up if app was down)
      while expense.next_occurrence_date.present? && expense.next_occurrence_date <= Date.current
        expense.generate_next_occurrence!
        expense.reload
      end
    rescue => e
      Rails.logger.error "[RecurringExpense] Failed for expense ##{expense.id}: #{e.message}"
    end
  end
end
