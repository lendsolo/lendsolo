class CreateExpenses < ActiveRecord::Migration[8.0]
  def change
    create_enum :expense_category, %w[legal filing software marketing insurance travel office other]

    create_table :expenses do |t|
      t.references :user, null: false, foreign_key: true
      t.string :description, null: false
      t.decimal :amount, precision: 12, scale: 2, null: false
      t.enum :category, enum_type: :expense_category, default: "other", null: false
      t.date :date, null: false

      t.timestamps
    end
  end
end
