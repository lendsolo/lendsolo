require "rails_helper"

RSpec.describe LatePaymentNoticeJob, type: :job do
  let(:user) do
    create(:user,
      email_late_notices_enabled: true,
      late_notice_days_after: 3,
      borrower_notification_email: "borrower@example.com"
    )
  end

  # Create an overdue loan (payment due > 3 days ago, no payments made)
  let(:loan) do
    create(:loan,
      user: user,
      status: :active,
      start_date: 2.months.ago.to_date,
      term_months: 12
    )
  end

  before do
    allow(LoanMailer).to receive_message_chain(:late_payment_notice, :deliver_now)
  end

  it "sends notice for overdue loan" do
    loan
    mailer_double = double("mailer")
    allow(LoanMailer).to receive(:late_payment_notice).and_return(mailer_double)
    allow(mailer_double).to receive(:deliver_now)

    described_class.perform_now

    expect(LoanMailer).to have_received(:late_payment_notice)
  end

  it "logs to EmailLog after sending" do
    loan
    mailer_double = double("mailer")
    allow(LoanMailer).to receive(:late_payment_notice).and_return(mailer_double)
    allow(mailer_double).to receive(:deliver_now)

    expect { described_class.perform_now }.to change(EmailLog, :count).by(1)
  end

  it "skips if already sent" do
    loan
    EmailLog.record_send!(
      user: user, loan: loan, email_type: "late_payment_notice",
      recipient_email: "borrower@example.com",
      payment_number: 1, reference_date: loan.next_payment_due_date
    )

    expect(LoanMailer).not_to receive(:late_payment_notice)
    described_class.perform_now
  end

  it "skips when late notices are disabled" do
    user.update!(email_late_notices_enabled: false)
    loan

    expect(LoanMailer).not_to receive(:late_payment_notice)
    described_class.perform_now
  end

  it "skips non-overdue loans" do
    create(:loan, user: user, status: :active, start_date: Date.current, term_months: 12)
    expect(LoanMailer).not_to receive(:late_payment_notice)
    described_class.perform_now
  end
end
