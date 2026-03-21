class AddSubscriptionFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    create_enum :subscription_plan, %w[free solo pro fund]

    add_column :users, :stripe_customer_id, :string
    add_column :users, :stripe_subscription_id, :string
    add_column :users, :subscription_plan, :enum, enum_type: :subscription_plan, default: "free", null: false
    add_column :users, :subscription_status, :string, default: "incomplete", null: false
    add_column :users, :trial_ends_at, :datetime

    add_index :users, :stripe_customer_id, unique: true
  end
end
