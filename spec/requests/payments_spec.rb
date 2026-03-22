require "rails_helper"

RSpec.describe "Payments", type: :request do
  let(:user) { create(:user, :free) }
  let(:loan) { create(:loan, user: user) }

  before { sign_in user }

  describe "GET /payments" do
    it "returns success" do
      get payments_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /loans/:loan_id/payments" do
    it "creates a payment with valid params" do
      expect {
        post loan_payments_path(loan), params: { payment: { amount: 1000, date: Date.current.to_s } }
      }.to change(Payment, :count).by(1)
      expect(response).to have_http_status(:redirect)
    end

    it "rejects payment with missing amount" do
      post loan_payments_path(loan), params: { payment: { amount: "", date: Date.current.to_s } }
      expect(response).to have_http_status(:redirect)
    end

    it "cannot create payment on another user's loan" do
      other_loan = create(:loan, user: create(:user))
      post loan_payments_path(other_loan), params: { payment: { amount: 1000, date: Date.current.to_s } }
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "GET /payments/export_csv" do
    context "plan gating" do
      it "blocks free users" do
        get export_csv_payments_path
        expect(response).to redirect_to(billing_path)
      end

      it "allows pro users" do
        user.update!(subscription_plan: "pro", subscription_status: "active")
        get export_csv_payments_path
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("text/csv")
      end
    end
  end

  describe "authentication" do
    it "redirects unauthenticated users" do
      sign_out user
      get payments_path
      expect(response).to redirect_to(new_user_session_path)
    end
  end
end
