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

    plans = [
      { name: "Solo", amount: 1900, lookup_key: "solo_monthly" },
      { name: "Pro", amount: 3900, lookup_key: "pro_monthly" },
      { name: "Fund", amount: 9900, lookup_key: "fund_monthly" }
    ]

    plans.each do |plan|
      price = Stripe::Price.create(
        product: product.id,
        unit_amount: plan[:amount],
        currency: "usd",
        recurring: { interval: "month" },
        lookup_key: plan[:lookup_key],
        metadata: { plan: plan[:name].downcase }
      )
      puts "Created #{plan[:name]} price: #{price.id} ($#{plan[:amount] / 100}/mo)"
      puts "  → Set STRIPE_#{plan[:name].upcase}_PRICE_ID=#{price.id}"
    end

    puts "\nDone! Add the price IDs above to your environment variables."
    puts "Also set up a webhook endpoint at /webhooks/stripe with these events:"
    puts "  - checkout.session.completed"
    puts "  - customer.subscription.updated"
    puts "  - customer.subscription.deleted"
    puts "  - invoice.payment_failed"
  end
end
