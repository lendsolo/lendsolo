class CreateCapitalTransactions < ActiveRecord::Migration[8.0]
  def up
    create_table :capital_transactions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :transaction_type, null: false
      t.decimal :amount, precision: 12, scale: 2, null: false
      t.date :date, null: false
      t.string :source
      t.text :note

      t.timestamps
    end

    add_index :capital_transactions, [:user_id, :date]

    # Data migration: create initial infusion for users with existing capital
    User.where("total_capital > 0").find_each do |user|
      execute <<-SQL
        INSERT INTO capital_transactions (user_id, transaction_type, amount, date, source, note, created_at, updated_at)
        VALUES (#{user.id}, 'infusion', #{user.total_capital.to_f}, '#{user.created_at.to_date}', 'Initial capital (migrated)', 'Auto-created from your original capital setting', NOW(), NOW())
      SQL
    end
  end

  def down
    drop_table :capital_transactions
  end
end
