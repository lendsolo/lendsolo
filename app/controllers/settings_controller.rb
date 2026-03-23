class SettingsController < ApplicationController
  def index
    render inertia: "Settings/Index", props: {
      user: {
        business_name: current_user.business_name || "",
        total_capital: (current_user.total_capital || 0).to_f,
        email: current_user.email,
        # Email settings
        email_reminders_enabled: current_user.email_reminders_enabled,
        email_receipts_enabled: current_user.email_receipts_enabled,
        email_late_notices_enabled: current_user.email_late_notices_enabled,
        email_monthly_summary_enabled: current_user.email_monthly_summary_enabled,
        reminder_days_before: current_user.reminder_days_before,
        late_notice_days_after: current_user.late_notice_days_after,
        borrower_notification_email: current_user.borrower_notification_email || "",
        # Tax filing info
        lender_tin: current_user.lender_tin_masked,
        lender_tin_present: current_user.lender_tin.present?,
        lender_street_address: current_user.lender_street_address || "",
        lender_city: current_user.lender_city || "",
        lender_state: current_user.lender_state || "",
        lender_zip: current_user.lender_zip || ""
      }
    }
  end

  def update
    filtered = settings_params
    # Don't overwrite existing TIN with blank (user left the masked field untouched)
    filtered = filtered.except(:lender_tin) if filtered[:lender_tin].blank?

    if current_user.update(filtered)
      redirect_to settings_path, notice: "Settings saved."
    else
      redirect_to settings_path, alert: current_user.errors.full_messages.join(", ")
    end
  end

  def send_test_email
    email_type = params[:email_type].to_s
    valid_types = %w[payment_reminder late_payment_notice payment_receipt monthly_portfolio_summary]

    unless valid_types.include?(email_type)
      redirect_to settings_path, alert: "Invalid email type."
      return
    end

    begin
      LoanMailer.preview_email(current_user, email_type).deliver_now
      redirect_to settings_path, notice: "Test email sent to #{current_user.email}."
    rescue => e
      redirect_to settings_path, alert: "Failed to send test email: #{e.message}"
    end
  end

  def reset_data
    unless params[:confirmation] == "DELETE"
      redirect_to settings_path, alert: "Please type DELETE to confirm data reset."
      return
    end

    current_user.email_logs.delete_all
    current_user.expenses.delete_all
    current_user.capital_transactions.delete_all
    current_user.loans.destroy_all  # cascades to payments via dependent: :destroy
    current_user.update!(total_capital: 0, business_name: nil)
    redirect_to settings_path, notice: "All data has been reset."
  end

  private

  def settings_params
    params.require(:setting).permit(
      :business_name,
      :total_capital,
      :email_reminders_enabled,
      :email_receipts_enabled,
      :email_late_notices_enabled,
      :email_monthly_summary_enabled,
      :reminder_days_before,
      :late_notice_days_after,
      :borrower_notification_email,
      :lender_tin,
      :lender_street_address,
      :lender_city,
      :lender_state,
      :lender_zip
    )
  end
end
