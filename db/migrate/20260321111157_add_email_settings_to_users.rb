class AddEmailSettingsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :email_reminders_enabled, :boolean, default: true, null: false
    add_column :users, :email_receipts_enabled, :boolean, default: true, null: false
    add_column :users, :email_late_notices_enabled, :boolean, default: true, null: false
    add_column :users, :email_monthly_summary_enabled, :boolean, default: true, null: false
    add_column :users, :reminder_days_before, :integer, default: 5, null: false
    add_column :users, :late_notice_days_after, :integer, default: 3, null: false
    add_column :users, :borrower_notification_email, :string
  end
end
