class AddBorrowerIdToLoans < ActiveRecord::Migration[8.0]
  def change
    add_reference :loans, :borrower, null: true, foreign_key: true
  end
end
