require "rails_helper"

RSpec.describe "Dashboard", type: :request do
  let(:user) { create(:user, :free) }

  before { sign_in user }

  describe "GET /" do
    it "returns success with no loans" do
      get dashboard_path
      expect(response).to have_http_status(:ok)
    end

    it "returns success with 10 active loans with payments" do
      10.times do |i|
        loan = create(:loan, user: user, borrower_name: "Borrower #{i}")
        2.times do |j|
          create(:payment, loan: loan, date: loan.start_date + (j + 1).months)
        end
      end

      get dashboard_path
      expect(response).to have_http_status(:ok)
    end
  end
end
