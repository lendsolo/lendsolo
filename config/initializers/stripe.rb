Stripe.api_key = ENV["STRIPE_SECRET_KEY"] if ENV["STRIPE_SECRET_KEY"].present?
Stripe.api_version = "2026-02-25.clover"

Rails.application.config.after_initialize do
  # NOTE: After creating new prices in Stripe, update all price ID env vars (monthly + annual)
  %w[STRIPE_SOLO_PRICE_ID STRIPE_PRO_PRICE_ID STRIPE_FUND_PRICE_ID
     STRIPE_SOLO_ANNUAL_PRICE_ID STRIPE_PRO_ANNUAL_PRICE_ID STRIPE_FUND_ANNUAL_PRICE_ID].each do |key|
    Rails.logger.warn("[Stripe] #{key} is not set - billing will not work for this plan") unless ENV[key].present?
  end
end
