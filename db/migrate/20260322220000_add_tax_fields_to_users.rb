class AddTaxFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :lender_tin, :string
    add_column :users, :lender_street_address, :string
    add_column :users, :lender_city, :string
    add_column :users, :lender_state, :string
    add_column :users, :lender_zip, :string
  end
end
