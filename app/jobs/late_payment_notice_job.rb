class LatePaymentNoticeJob < ApplicationJob
  queue_as :default

  def perform
    User.where(email_late_notices_enabled: true).find_each do |user|
      notice_threshold = user.late_notice_days_after

      user.loans.where(status: :active).find_each do |loan|
        next unless loan.overdue?

        days_overdue = loan.days_overdue
        next unless days_overdue >= notice_threshold

        due_date = loan.next_payment_due_date
        payment_number = loan.payments_made_count + 1

        # Skip if already sent for this overdue period
        next if EmailLog.already_sent?(
          user: user,
          loan: loan,
          email_type: "late_payment_notice",
          payment_number: payment_number,
          reference_date: due_date
        )

        recipient = user.borrower_notification_email
        next if recipient.blank?

        begin
          LoanMailer.late_payment_notice(loan, days_overdue).deliver_now

          EmailLog.record_send!(
            user: user,
            loan: loan,
            email_type: "late_payment_notice",
            recipient_email: recipient,
            payment_number: payment_number,
            reference_date: due_date
          )

          Rails.logger.info "[LatePaymentNotice] Sent notice for loan ##{loan.id} (#{loan.borrower_name}), #{days_overdue} days overdue"
        rescue => e
          Rails.logger.error "[LatePaymentNotice] Failed for loan ##{loan.id}: #{e.message}"
        end
      end
    end
  end
end
