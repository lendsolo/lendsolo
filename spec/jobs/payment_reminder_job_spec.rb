require "rails_helper"

RSpec.describe PaymentReminderJob, type: :job do
  let(:user) do
    create(:user,
      email_reminders_enabled: true,
      reminder_days_before: 5,
      borrower_notification_email: "borrower@example.com"
    )
  end

  let(:loan) do
    create(:loan,
      user: user,
      status: :active,
      start_date: (Date.current - 1.month + 5.days),
      term_months: 12
    )
  end

  before do
    allow(LoanMailer).to receive_message_chain(:payment_reminder, :deliver_now)
  end

  it "sends reminder for upcoming payment" do
    loan # create the loan
    mailer_double = double("mailer")
    allow(LoanMailer).to receive(:payment_reminder).and_return(mailer_double)
    allow(mailer_double).to receive(:deliver_now)

    described_class.perform_now

    expect(LoanMailer).to have_received(:payment_reminder)
  end

  it "logs to EmailLog after sending" do
    loan
    mailer_double = double("mailer")
    allow(LoanMailer).to receive(:payment_reminder).and_return(mailer_double)
    allow(mailer_double).to receive(:deliver_now)

    expect { described_class.perform_now }.to change(EmailLog, :count).by(1)
  end

  it "skips if already sent" do
    loan
    EmailLog.record_send!(
      user: user, loan: loan, email_type: "payment_reminder",
      recipient_email: "borrower@example.com",
      payment_number: 1, reference_date: loan.next_payment_due_date
    )

    expect(LoanMailer).not_to receive(:payment_reminder)
    described_class.perform_now
  end

  it "skips when reminders are disabled" do
    user.update!(email_reminders_enabled: false)
    loan

    expect(LoanMailer).not_to receive(:payment_reminder)
    described_class.perform_now
  end

  it "skips when no borrower email" do
    user.update!(borrower_notification_email: nil)
    loan

    expect(LoanMailer).not_to receive(:payment_reminder)
    described_class.perform_now
  end
end
