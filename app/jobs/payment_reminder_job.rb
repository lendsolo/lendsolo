class PaymentReminderJob < ApplicationJob
  queue_as :default

  def perform
    User.where(email_reminders_enabled: true).find_each do |user|
      reminder_window = user.reminder_days_before.days.from_now.to_date

      user.loans.where(status: :active).find_each do |loan|
        next_due = loan.next_payment_due_date
        next unless next_due
        next unless next_due <= reminder_window && next_due >= Date.current

        payment_number = loan.payments_made_count + 1

        # Skip if already sent for this payment
        next if EmailLog.already_sent?(
          user: user,
          loan: loan,
          email_type: "payment_reminder",
          payment_number: payment_number,
          reference_date: next_due
        )

        # Skip if no valid recipient email
        recipient = user.borrower_notification_email
        next if recipient.blank?

        begin
          LoanMailer.payment_reminder(loan, payment_number).deliver_now

          EmailLog.record_send!(
            user: user,
            loan: loan,
            email_type: "payment_reminder",
            recipient_email: recipient,
            payment_number: payment_number,
            reference_date: next_due
          )

          Rails.logger.info "[PaymentReminder] Sent reminder for loan ##{loan.id} (#{loan.borrower_name}), payment ##{payment_number} due #{next_due}"
        rescue => e
          Rails.logger.error "[PaymentReminder] Failed for loan ##{loan.id}: #{e.message}"
        end
      end
    end
  end
end
