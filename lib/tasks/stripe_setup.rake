namespace :stripe do
  desc "Create Stripe products and prices for LendSolo plans"
  task setup: :environment do
    puts "Creating Stripe products and prices..."
    puts "Make sure STRIPE_SECRET_KEY is set to your live/test key.\n\n"

    product = Stripe::Product.create(
      name: "LendSolo",
      description: "Loan management for micro-lenders"
    )
    puts "Created product: #{product.id}"

    monthly_plans = [
      { name: "Solo", amount: 2900, lookup_key: "solo_monthly" },
      { name: "Pro", amount: 4900, lookup_key: "pro_monthly" },
      { name: "Fund", amount: 9900, lookup_key: "fund_monthly" }
    ]

    annual_plans = [
      { name: "Solo", amount: 29_000, lookup_key: "solo_annual" },
      { name: "Pro", amount: 49_000, lookup_key: "pro_annual" },
      { name: "Fund", amount: 99_000, lookup_key: "fund_annual" }
    ]

    monthly_plans.each do |plan|
      price = Stripe::Price.create(
        product: product.id,
        unit_amount: plan[:amount],
        currency: "usd",
        recurring: { interval: "month" },
        lookup_key: plan[:lookup_key],
        metadata: { plan: plan[:name].downcase, billing_period: "monthly" }
      )
      puts "Created #{plan[:name]} monthly price: #{price.id} ($#{plan[:amount] / 100}/mo)"
      puts "  → Set STRIPE_#{plan[:name].upcase}_PRICE_ID=#{price.id}"
    end

    annual_plans.each do |plan|
      price = Stripe::Price.create(
        product: product.id,
        unit_amount: plan[:amount],
        currency: "usd",
        recurring: { interval: "year" },
        lookup_key: plan[:lookup_key],
        metadata: { plan: plan[:name].downcase, billing_period: "annual" }
      )
      puts "Created #{plan[:name]} annual price: #{price.id} ($#{plan[:amount] / 100}/yr)"
      puts "  → Set STRIPE_#{plan[:name].upcase}_ANNUAL_PRICE_ID=#{price.id}"
    end

    puts "\nDone! Add the price IDs above to your environment variables."
    puts "Also set up a webhook endpoint at /webhooks/stripe with these events:"
    puts "  - checkout.session.completed"
    puts "  - customer.subscription.updated"
    puts "  - customer.subscription.deleted"
    puts "  - invoice.payment_failed"
  end

  desc "Migrate existing Stripe prices: update Solo/Pro monthly amounts, add annual prices for all tiers"
  task migrate_prices: :environment do
    puts "Migrating Stripe prices..."
    puts "Make sure STRIPE_SECRET_KEY is set.\n\n"

    # Look up the existing product from one of the current price IDs
    existing_price_id = ENV["STRIPE_SOLO_PRICE_ID"].presence ||
                        ENV["STRIPE_PRO_PRICE_ID"].presence ||
                        ENV["STRIPE_FUND_PRICE_ID"].presence

    unless existing_price_id
      abort "ERROR: No existing STRIPE_*_PRICE_ID env var is set. Cannot determine product ID.\n" \
            "Set at least one of STRIPE_SOLO_PRICE_ID, STRIPE_PRO_PRICE_ID, or STRIPE_FUND_PRICE_ID."
    end

    existing_price = Stripe::Price.retrieve(existing_price_id)
    product_id = existing_price.product
    puts "Found existing product: #{product_id}\n\n"

    # New monthly prices for Solo and Pro (Fund monthly is unchanged at 9900)
    new_monthly = [
      { name: "Solo", amount: 2900, lookup_key: "solo_monthly" },
      { name: "Pro", amount: 4900, lookup_key: "pro_monthly" }
    ]

    # Annual prices for all tiers
    new_annual = [
      { name: "Solo", amount: 29_000, lookup_key: "solo_annual" },
      { name: "Pro", amount: 49_000, lookup_key: "pro_annual" },
      { name: "Fund", amount: 99_000, lookup_key: "fund_annual" }
    ]

    puts "── Creating new monthly prices (Solo $29, Pro $49) ──"
    new_monthly.each do |plan|
      price = Stripe::Price.create(
        product: product_id,
        unit_amount: plan[:amount],
        currency: "usd",
        recurring: { interval: "month" },
        lookup_key: plan[:lookup_key],
        transfer_lookup_key: true,
        metadata: { plan: plan[:name].downcase, billing_period: "monthly" }
      )
      puts "Created #{plan[:name]} monthly: #{price.id} ($#{plan[:amount] / 100}/mo)"
      puts "  → Update STRIPE_#{plan[:name].upcase}_PRICE_ID=#{price.id}"
    end

    puts "\n── Creating annual prices ──"
    new_annual.each do |plan|
      price = Stripe::Price.create(
        product: product_id,
        unit_amount: plan[:amount],
        currency: "usd",
        recurring: { interval: "year" },
        lookup_key: plan[:lookup_key],
        metadata: { plan: plan[:name].downcase, billing_period: "annual" }
      )
      puts "Created #{plan[:name]} annual: #{price.id} ($#{plan[:amount] / 100}/yr)"
      puts "  → Set STRIPE_#{plan[:name].upcase}_ANNUAL_PRICE_ID=#{price.id}"
    end

    puts "\n── Summary ──"
    puts "1. Update these env vars with the new price IDs above:"
    puts "   STRIPE_SOLO_PRICE_ID  (new $29/mo price)"
    puts "   STRIPE_PRO_PRICE_ID   (new $49/mo price)"
    puts "   STRIPE_SOLO_ANNUAL_PRICE_ID"
    puts "   STRIPE_PRO_ANNUAL_PRICE_ID"
    puts "   STRIPE_FUND_ANNUAL_PRICE_ID"
    puts "2. STRIPE_FUND_PRICE_ID is unchanged (still $99/mo)"
    puts "3. Old Solo ($19) and Pro ($39) prices are NOT deleted — archive them in Stripe dashboard"
    puts "4. Existing subscribers stay on their current price until they change plans"
  end
end
