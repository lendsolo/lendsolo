require "rails_helper"

RSpec.describe MonthlySummaryJob, type: :job do
  let(:user) { create(:user, email_monthly_summary_enabled: true) }

  before do
    allow(LoanMailer).to receive_message_chain(:monthly_portfolio_summary, :deliver_now)
  end

  it "sends summary to users with loans" do
    create(:loan, user: user)
    mailer_double = double("mailer")
    allow(LoanMailer).to receive(:monthly_portfolio_summary).and_return(mailer_double)
    allow(mailer_double).to receive(:deliver_now)

    described_class.perform_now

    expect(LoanMailer).to have_received(:monthly_portfolio_summary).with(user)
  end

  it "logs to EmailLog after sending" do
    create(:loan, user: user)
    mailer_double = double("mailer")
    allow(LoanMailer).to receive(:monthly_portfolio_summary).and_return(mailer_double)
    allow(mailer_double).to receive(:deliver_now)

    expect { described_class.perform_now }.to change(EmailLog, :count).by(1)
  end

  it "skips if already sent this month" do
    create(:loan, user: user)
    EmailLog.record_send!(
      user: user, email_type: "monthly_portfolio_summary",
      recipient_email: user.email,
      reference_date: Date.current.beginning_of_month
    )

    expect(LoanMailer).not_to receive(:monthly_portfolio_summary)
    described_class.perform_now
  end

  it "skips users with no loans" do
    expect(LoanMailer).not_to receive(:monthly_portfolio_summary)
    described_class.perform_now
  end

  it "skips when summary disabled" do
    user.update!(email_monthly_summary_enabled: false)
    create(:loan, user: user)

    expect(LoanMailer).not_to receive(:monthly_portfolio_summary)
    described_class.perform_now
  end
end
