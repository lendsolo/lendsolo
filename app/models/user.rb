class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :loans, dependent: :destroy
  has_many :expenses, dependent: :destroy
  has_many :email_logs, dependent: :destroy

  attribute :subscription_plan, :string, default: "free"
  enum :subscription_plan, { free: "free", solo: "solo", pro: "pro", fund: "fund" }

  # ── Subscription helpers ────────────────────────────────────────────────────

  PLAN_LIMITS = { "free" => 2, "solo" => 5, "pro" => 25, "fund" => Float::INFINITY }.freeze

  def loan_limit
    PLAN_LIMITS[subscription_plan] || 2
  end

  def active_loan_count
    loans.where(status: :active).count
  end

  def can_create_loan?
    active_loan_count < loan_limit
  end

  def on_trial?
    trial_ends_at.present? && trial_ends_at > Time.current && subscription_plan == "free"
  end

  def trial_days_remaining
    return 0 unless on_trial?
    ((trial_ends_at - Time.current) / 1.day).ceil
  end

  def trial_expired?
    trial_ends_at.present? && trial_ends_at <= Time.current && subscription_plan == "free"
  end

  def active_subscription?
    %w[solo pro fund].include?(subscription_plan) && subscription_status == "active"
  end

  def effective_plan
    return subscription_plan if active_subscription?
    return "solo" if on_trial?  # Trial gives Solo-level access
    "free"
  end

  def effective_loan_limit
    PLAN_LIMITS[effective_plan] || 2
  end

  def can_create_loan_with_plan?
    active_loan_count < effective_loan_limit
  end

  def start_trial!
    return if trial_ends_at.present? # Only one trial
    return if active_subscription?

    update!(trial_ends_at: 14.days.from_now)
  end

  def ensure_stripe_customer!
    return stripe_customer_id if stripe_customer_id.present?

    customer = Stripe::Customer.create(
      email: email,
      name: business_name,
      metadata: { lendsolo_user_id: id }
    )
    update!(stripe_customer_id: customer.id)
    customer.id
  end
end
