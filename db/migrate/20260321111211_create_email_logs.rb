class CreateEmailLogs < ActiveRecord::Migration[8.0]
  def change
    create_table :email_logs do |t|
      t.references :user, null: false, foreign_key: true
      t.references :loan, foreign_key: true
      t.string :email_type, null: false
      t.string :recipient_email, null: false
      t.integer :payment_number
      t.date :reference_date
      t.timestamps
    end

    add_index :email_logs, [:loan_id, :email_type, :payment_number, :reference_date],
              unique: true, name: "idx_email_logs_unique_send"
  end
end
