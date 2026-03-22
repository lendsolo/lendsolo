require "rails_helper"

RSpec.describe "Loans with Borrower association", type: :request do
  let(:user) { User.create!(email: "lender@test.com", password: "password123", has_completed_onboarding: true) }

  before { sign_in user }

  describe "POST /loans with borrower_id" do
    it "creates a loan associated with an existing borrower" do
      borrower = user.borrowers.create!(name: "Alice")

      post loans_path, params: {
        loan: {
          borrower_id: borrower.id,
          borrower_name: "Alice",
          principal: 10000,
          annual_rate: 10,
          term_months: 12,
          start_date: Date.current.to_s,
          loan_type: "standard"
        }
      }

      loan = user.loans.last
      expect(loan.borrower).to eq(borrower)
      expect(loan.borrower_name).to eq("Alice")
    end

    it "creates a borrower when only borrower_name is provided" do
      expect {
        post loans_path, params: {
          loan: {
            borrower_name: "New Person",
            principal: 10000,
            annual_rate: 10,
            term_months: 12,
            start_date: Date.current.to_s,
            loan_type: "standard"
          }
        }
      }.to change(Borrower, :count).by(1)

      loan = user.loans.last
      expect(loan.borrower).to be_present
      expect(loan.borrower.name).to eq("New Person")
    end
  end
end
