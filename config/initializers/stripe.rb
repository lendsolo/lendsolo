Stripe.api_key = ENV["STRIPE_SECRET_KEY"] if ENV["STRIPE_SECRET_KEY"].present?

Rails.application.config.after_initialize do
  %w[STRIPE_SOLO_PRICE_ID STRIPE_PRO_PRICE_ID STRIPE_FUND_PRICE_ID].each do |key|
    Rails.logger.warn("[Stripe] #{key} is not set - billing will not work for this plan") unless ENV[key].present?
  end
end
