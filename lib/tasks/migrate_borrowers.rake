namespace :data do
  desc "Migrate existing borrower_name strings on loans to Borrower records"
  task migrate_borrowers: :environment do
    total_borrowers = 0
    total_users = 0
    total_loans_updated = 0
    errors = []

    User.find_each do |user|
      loans = user.loans.where(borrower_id: nil)
      next if loans.empty?

      total_users += 1

      # Group loans by normalized borrower name for case-insensitive dedup
      grouped = loans.group_by { |l| (l.borrower_name.presence || "").strip.downcase }

      grouped.each do |normalized_name, matching_loans|
        # Use the first non-blank original name, or "Unknown Borrower"
        display_name = matching_loans
          .map { |l| l.borrower_name.presence&.strip }
          .compact
          .first || "Unknown Borrower"

        borrower = user.borrowers.find_or_create_by!(name: display_name)
        total_borrowers += 1

        matching_loans.each do |loan|
          loan.update_columns(borrower_id: borrower.id)
          total_loans_updated += 1
        end
      end
    end

    # Verify no orphaned loans
    orphaned = Loan.where(borrower_id: nil)
    if orphaned.any?
      orphaned.each do |loan|
        errors << "Loan ##{loan.id} (user #{loan.user_id}) still has no borrower_id"
      end
    end

    puts "Migrated #{total_borrowers} borrowers for #{total_users} users, #{total_loans_updated} loans updated"

    if errors.any?
      puts "ERRORS:"
      errors.each { |e| puts "  - #{e}" }
    else
      puts "All loans have borrower_id assigned."
    end
  end
end
