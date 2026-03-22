class AddRecurringFieldsToExpenses < ActiveRecord::Migration[8.0]
  def change
    add_column :expenses, :recurring, :boolean, default: false, null: false
    add_column :expenses, :frequency, :string
    add_column :expenses, :next_occurrence_date, :date
    add_column :expenses, :recurring_parent_id, :bigint
    add_column :expenses, :active, :boolean, default: true, null: false

    add_foreign_key :expenses, :expenses, column: :recurring_parent_id
    add_index :expenses, :recurring_parent_id
    add_index :expenses, [:recurring, :active, :next_occurrence_date], name: "index_expenses_on_recurring_active_next_date"
  end
end
