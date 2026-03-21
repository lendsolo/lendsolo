class MonthlySummaryJob < ApplicationJob
  queue_as :default

  def perform
    User.where(email_monthly_summary_enabled: true).find_each do |user|
      # Only send to users who have active loans or had activity last month
      next unless user.loans.exists?

      reference_date = Date.current.beginning_of_month

      # Skip if already sent for this month
      next if EmailLog.already_sent?(
        user: user,
        email_type: "monthly_portfolio_summary",
        reference_date: reference_date
      )

      begin
        LoanMailer.monthly_portfolio_summary(user).deliver_now

        EmailLog.record_send!(
          user: user,
          email_type: "monthly_portfolio_summary",
          recipient_email: user.email,
          reference_date: reference_date
        )

        Rails.logger.info "[MonthlySummary] Sent portfolio summary to #{user.email}"
      rescue => e
        Rails.logger.error "[MonthlySummary] Failed for user ##{user.id}: #{e.message}"
      end
    end
  end
end
