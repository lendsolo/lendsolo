class CreateLoans < ActiveRecord::Migration[8.0]
  def change
    create_enum :loan_type, %w[standard interest_only balloon]
    create_enum :loan_status, %w[active paid_off defaulted written_off]

    create_table :loans do |t|
      t.references :user, null: false, foreign_key: true
      t.string :borrower_name, null: false
      t.decimal :principal, precision: 12, scale: 2, null: false
      t.decimal :annual_rate, precision: 5, scale: 2, null: false
      t.integer :term_months, null: false
      t.enum :loan_type, enum_type: :loan_type, default: "standard", null: false
      t.date :start_date, null: false
      t.enum :status, enum_type: :loan_status, default: "active", null: false
      t.string :purpose
      t.text :collateral_description
      t.text :notes

      t.timestamps
    end
  end
end
