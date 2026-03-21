class CreateWaitlistEntries < ActiveRecord::Migration[8.0]
  def change
    create_table :waitlist_entries do |t|
      t.string :email, null: false
      t.string :tier, null: false, default: "fund"
      t.timestamps
    end

    add_index :waitlist_entries, [:email, :tier], unique: true
  end
end
