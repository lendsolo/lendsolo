namespace :loans do
  desc "Backfill cached_next_payment_date and cached_next_payment_amount for all active loans"
  task backfill_payment_cache: :environment do
    loans = Loan.where(status: :active)
    total = loans.count
    puts "Backfilling payment cache for #{total} active loans..."

    loans.find_each.with_index do |loan, i|
      loan.refresh_payment_cache!
      print "." if (i + 1) % 10 == 0
    end

    puts "\nDone. #{total} loans updated."
  end
end
