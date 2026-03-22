class SubscriptionsController < ApplicationController
  PLAN_PRICES = {
    "solo" => ENV.fetch("STRIPE_SOLO_PRICE_ID", "price_solo_placeholder"),
    "pro" => ENV.fetch("STRIPE_PRO_PRICE_ID", "price_pro_placeholder"),
    "fund" => ENV.fetch("STRIPE_FUND_PRICE_ID", "price_fund_placeholder")
  }.freeze

  PLAN_DETAILS = {
    "free" => { name: "Free", price: 0, loan_limit: 2, features: ["2 active loans", "Basic amortization", "Payment tracking"] },
    "solo" => { name: "Solo", price: 19, loan_limit: 5, features: ["5 active loans", "Full amortization schedules", "Payment tracking", "Expense tracking", "Spreadsheet import (CSV & Excel)", "Smart guardrails"] },
    "pro" => { name: "Pro", price: 39, loan_limit: 25, features: ["25 active loans", "Everything in Solo", "CSV exports (payments & expenses)", "Tax reporting exports (PDF, QBO)", "Priority support", "Portfolio analytics"] },
    "fund" => { name: "Fund", price: 99, loan_limit: nil, features: ["Unlimited loans", "Everything in Pro", "Multi-user access (coming soon)", "API access (coming soon)", "Dedicated support"] }
  }.freeze

  def show
    render inertia: "Billing/Show", props: {
      plan: current_user.effective_plan,
      subscription_plan: current_user.subscription_plan,
      subscription_status: current_user.subscription_status,
      on_trial: current_user.on_trial?,
      trial_days_remaining: current_user.trial_days_remaining,
      trial_expired: current_user.trial_expired?,
      active_loan_count: current_user.active_loan_count,
      loan_limit: current_user.effective_loan_limit.infinite? ? nil : current_user.effective_loan_limit.to_i,
      plans: PLAN_DETAILS
    }
  end

  def create
    plan = params[:plan]

    unless PLAN_PRICES.key?(plan)
      redirect_to billing_path, alert: "Invalid plan selected."
      return
    end

    customer_id = current_user.ensure_stripe_customer!

    session = Stripe::Checkout::Session.create(
      customer: customer_id,
      mode: "subscription",
      line_items: [{ price: PLAN_PRICES[plan], quantity: 1 }],
      success_url: "#{request.base_url}/billing?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "#{request.base_url}/billing",
      subscription_data: {
        metadata: { lendsolo_user_id: current_user.id, plan: plan }
      },
      metadata: { lendsolo_user_id: current_user.id, plan: plan }
    )

    render inertia: "Billing/Show", props: {
      redirect_url: session.url,
      plan: current_user.effective_plan,
      subscription_plan: current_user.subscription_plan,
      subscription_status: current_user.subscription_status,
      on_trial: current_user.on_trial?,
      trial_days_remaining: current_user.trial_days_remaining,
      trial_expired: current_user.trial_expired?,
      active_loan_count: current_user.active_loan_count,
      loan_limit: current_user.effective_loan_limit.infinite? ? nil : current_user.effective_loan_limit.to_i,
      plans: PLAN_DETAILS
    }
  end

  def portal
    customer_id = current_user.ensure_stripe_customer!

    session = Stripe::BillingPortal::Session.create(
      customer: customer_id,
      return_url: "#{request.base_url}/billing"
    )

    render inertia: "Billing/Show", props: {
      redirect_url: session.url,
      plan: current_user.effective_plan,
      subscription_plan: current_user.subscription_plan,
      subscription_status: current_user.subscription_status,
      on_trial: current_user.on_trial?,
      trial_days_remaining: current_user.trial_days_remaining,
      trial_expired: current_user.trial_expired?,
      active_loan_count: current_user.active_loan_count,
      loan_limit: current_user.effective_loan_limit.infinite? ? nil : current_user.effective_loan_limit.to_i,
      plans: PLAN_DETAILS
    }
  end
end
