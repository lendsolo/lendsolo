class CreateBorrowers < ActiveRecord::Migration[8.0]
  def change
    create_table :borrowers do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.string :email
      t.string :phone
      t.string :address_line1
      t.string :address_line2
      t.string :city
      t.string :state
      t.string :zip
      t.text :notes
      t.string :tin
      t.boolean :archived, default: false, null: false
      t.timestamps
    end

    add_index :borrowers, [:user_id, :name]
  end
end
