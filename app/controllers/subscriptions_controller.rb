class SubscriptionsController < ApplicationController
  # NOTE: After creating new prices in Stripe dashboard, update these env vars in production:
  # STRIPE_SOLO_PRICE_ID, STRIPE_PRO_PRICE_ID, STRIPE_FUND_PRICE_ID (monthly)
  # STRIPE_SOLO_ANNUAL_PRICE_ID, STRIPE_PRO_ANNUAL_PRICE_ID, STRIPE_FUND_ANNUAL_PRICE_ID (annual)
  def self.plan_prices
    {
      "solo" => ENV.fetch("STRIPE_SOLO_PRICE_ID", ""),
      "pro" => ENV.fetch("STRIPE_PRO_PRICE_ID", ""),
      "fund" => ENV.fetch("STRIPE_FUND_PRICE_ID", ""),
      "solo_annual" => ENV.fetch("STRIPE_SOLO_ANNUAL_PRICE_ID", ""),
      "pro_annual" => ENV.fetch("STRIPE_PRO_ANNUAL_PRICE_ID", ""),
      "fund_annual" => ENV.fetch("STRIPE_FUND_ANNUAL_PRICE_ID", "")
    }
  end

  PLAN_DETAILS = {
    "free" => { name: "Free", price: 0, loan_limit: 2, features: ["2 active loans", "Basic amortization", "Payment tracking"] },
    "solo" => { name: "Solo", price: 29, annual_price: 290, loan_limit: 5, features: ["5 active loans", "Full amortization schedules", "Payment tracking", "Expense tracking", "Spreadsheet import (CSV & Excel)", "Smart guardrails"] },
    "pro" => { name: "Pro", price: 49, annual_price: 490, loan_limit: 25, features: ["25 active loans", "Everything in Solo", "CSV exports (payments & expenses)", "Tax reporting exports (PDF, QBO)", "Priority support", "Portfolio analytics"] },
    "fund" => { name: "Fund", price: 99, annual_price: 990, loan_limit: nil, features: ["Unlimited loans", "Everything in Pro", "Multi-user access (coming soon)", "API access (coming soon)", "Dedicated support"] }
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
    interval = params[:interval] == "annual" ? "annual" : "monthly"

    base_plans = %w[solo pro fund]
    unless base_plans.include?(plan)
      redirect_to billing_path, alert: "Invalid plan selected."
      return
    end

    price_key = interval == "annual" ? "#{plan}_annual" : plan
    prices = self.class.plan_prices
    price_id = prices[price_key]
    if price_id.blank?
      Rails.logger.error("[Stripe] Missing price ID for plan: #{plan}, interval: #{interval}")
      redirect_to billing_path, alert: "Billing is not configured for this plan. Please contact support."
      return
    end

    customer_id = current_user.ensure_stripe_customer!

    session = Stripe::Checkout::Session.create(
      customer: customer_id,
      mode: "subscription",
      line_items: [{ price: price_id, quantity: 1 }],
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
