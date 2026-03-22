class AddCachedPaymentFieldsToLoans < ActiveRecord::Migration[8.0]
  def change
    add_column :loans, :cached_next_payment_date, :date
    add_column :loans, :cached_next_payment_amount, :decimal, precision: 12, scale: 2
  end
end
