class BulkBorrowerStatementsEmailJob < ApplicationJob
  queue_as :default

  def perform(user_id, year)
    user = User.find(user_id)
    year = year.to_i
    year_start = Date.new(year, 1, 1)
    year_end = Date.new(year, 12, 31)

    borrowers = user.borrowers.active.includes(loans: :payments)

    sent_count = 0
    skipped_count = 0

    borrowers.find_each do |borrower|
      next if borrower.email.blank?

      # Check if borrower has payment activity this year
      has_activity = borrower.loans.any? do |loan|
        loan.payments.where(date: year_start..year_end).exists?
      end
      next unless has_activity

      # Skip if already sent
      if EmailLog.already_sent?(user: user, email_type: "borrower_interest_statement", reference_date: year_start, payment_number: borrower.id)
        skipped_count += 1
        next
      end

      begin
        LoanMailer.borrower_interest_statement(borrower: borrower, lender: user, year: year).deliver_now

        EmailLog.record_send!(
          user: user,
          email_type: "borrower_interest_statement",
          recipient_email: borrower.email,
          reference_date: year_start,
          payment_number: borrower.id
        )

        sent_count += 1
      rescue => e
        Rails.logger.error "[Statement] Failed to email statement to borrower_id=#{borrower.id}: #{e.message}"
      end
    end

    Rails.logger.info "[Statement] Bulk email complete for user_id=#{user_id} year=#{year}: sent=#{sent_count} skipped=#{skipped_count}"
  end
end
