class CreatePayments < ActiveRecord::Migration[8.0]
  def change
    create_table :payments do |t|
      t.references :loan, null: false, foreign_key: true
      t.decimal :amount, precision: 12, scale: 2, null: false
      t.date :date, null: false
      t.decimal :principal_portion, precision: 12, scale: 2, null: false
      t.decimal :interest_portion, precision: 12, scale: 2, null: false
      t.decimal :late_fee, precision: 12, scale: 2, default: 0
      t.text :note

      t.timestamps
    end
  end
end
