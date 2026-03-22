require "rails_helper"

RSpec.describe EmailLog, type: :model do
  describe "associations" do
    it "belongs to user" do
      expect(build(:email_log)).to respond_to(:user)
    end

    it "optionally belongs to loan" do
      log = build(:email_log, loan: nil)
      expect(log).to be_valid
    end
  end

  describe "validations" do
    it "requires email_type" do
      log = build(:email_log, email_type: nil)
      expect(log).not_to be_valid
    end

    it "requires recipient_email" do
      log = build(:email_log, recipient_email: nil)
      expect(log).not_to be_valid
    end
  end

  describe ".already_sent?" do
    it "returns true when matching log exists" do
      user = create(:user)
      loan = create(:loan, user: user)
      create(:email_log, user: user, loan: loan, email_type: "payment_reminder",
             payment_number: 1, reference_date: Date.current)

      expect(EmailLog.already_sent?(
        user: user, loan: loan, email_type: "payment_reminder",
        payment_number: 1, reference_date: Date.current
      )).to be true
    end

    it "returns false when no matching log" do
      user = create(:user)
      expect(EmailLog.already_sent?(
        user: user, email_type: "payment_reminder",
        payment_number: 1, reference_date: Date.current
      )).to be false
    end
  end

  describe ".record_send!" do
    it "creates a new email log" do
      user = create(:user)
      expect {
        EmailLog.record_send!(
          user: user, email_type: "monthly_portfolio_summary",
          recipient_email: user.email, reference_date: Date.current
        )
      }.to change(EmailLog, :count).by(1)
    end
  end

  describe "scopes" do
    it ".for_type filters by email type" do
      user = create(:user)
      create(:email_log, user: user, email_type: "payment_reminder")
      create(:email_log, user: user, email_type: "late_payment_notice")

      expect(EmailLog.for_type("payment_reminder").count).to eq(1)
    end
  end
end
