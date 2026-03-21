class WebhooksController < ApplicationController
  skip_before_action :authenticate_user!
  skip_before_action :redirect_to_onboarding
  skip_forgery_protection

  def stripe
    payload = request.body.read
    sig_header = request.env["HTTP_STRIPE_SIGNATURE"]
    endpoint_secret = ENV.fetch("STRIPE_WEBHOOK_SECRET", "whsec_placeholder")

    begin
      event = Stripe::Webhook.construct_event(payload, sig_header, endpoint_secret)
    rescue JSON::ParserError
      head :bad_request
      return
    rescue Stripe::SignatureVerificationError
      head :bad_request
      return
    end

    Rails.logger.info("[Stripe] Received webhook event: #{event.type}")

    case event.type
    when "checkout.session.completed"
      handle_checkout_completed(event.data.object)
    when "customer.subscription.updated"
      handle_subscription_updated(event.data.object)
    when "customer.subscription.deleted"
      handle_subscription_deleted(event.data.object)
    when "invoice.payment_failed"
      handle_payment_failed(event.data.object)
    else
      Rails.logger.info("[Stripe] Unhandled event type: #{event.type}")
    end

    head :ok
  end

  private

  def handle_checkout_completed(session)
    Rails.logger.info("[Stripe] Checkout session metadata: #{session.metadata.to_h}")
    Rails.logger.info("[Stripe] Checkout session customer: #{session.customer}")

    user = find_user_from_metadata(session.metadata)

    # Fallback: find user by stripe_customer_id if metadata lookup fails
    user ||= User.find_by(stripe_customer_id: session.customer)

    unless user
      Rails.logger.error("[Stripe] Could not find user for checkout session #{session.id}")
      return
    end

    subscription = Stripe::Subscription.retrieve(session.subscription)
    plan = session.metadata["plan"] || determine_plan(subscription)

    user.update!(
      stripe_subscription_id: subscription.id,
      subscription_plan: plan,
      subscription_status: "active"
    )

    Rails.logger.info("[Stripe] Checkout completed for user #{user.id}, plan: #{plan}")
  end

  def handle_subscription_updated(subscription)
    user = User.find_by(stripe_subscription_id: subscription.id)
    user ||= User.find_by(stripe_customer_id: subscription.customer)
    return unless user

    plan = subscription.metadata["plan"] || determine_plan(subscription)
    status = subscription.status == "active" ? "active" : subscription.status

    user.update!(
      stripe_subscription_id: subscription.id,
      subscription_plan: plan,
      subscription_status: status
    )

    Rails.logger.info("[Stripe] Subscription updated for user #{user.id}, plan: #{plan}, status: #{status}")
  end

  def handle_subscription_deleted(subscription)
    user = User.find_by(stripe_subscription_id: subscription.id)
    user ||= User.find_by(stripe_customer_id: subscription.customer)
    return unless user

    user.update!(
      subscription_plan: "free",
      subscription_status: "canceled",
      stripe_subscription_id: nil
    )

    Rails.logger.info("[Stripe] Subscription canceled for user #{user.id}")
  end

  def handle_payment_failed(invoice)
    customer_id = invoice.customer
    user = User.find_by(stripe_customer_id: customer_id)
    return unless user

    user.update!(subscription_status: "past_due")

    Rails.logger.info("[Stripe] Payment failed for user #{user.id}")
  end

  def find_user_from_metadata(metadata)
    user_id = metadata["lendsolo_user_id"]
    User.find_by(id: user_id) if user_id
  end

  def determine_plan(subscription)
    price_id = subscription.items.data.first&.price&.id
    plan_prices = SubscriptionsController::PLAN_PRICES
    plan_prices.key(price_id) || "solo"
  end
end
