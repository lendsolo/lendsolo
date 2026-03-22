require "rails_helper"

RSpec.describe "API::AI", type: :request do
  let(:user) { create(:user) }
  let(:loan) { create(:loan, user: user) }

  before { sign_in user }

  describe "POST /api/ai/deal_memo" do
    it "blocks free users with 403" do
      post "/api/ai/deal_memo", params: { loan_id: loan.id }, as: :json
      expect(response).to have_http_status(:forbidden)
      body = JSON.parse(response.body)
      expect(body["success"]).to be false
    end

    it "blocks solo users with 403" do
      user.update!(subscription_plan: "solo", subscription_status: "active")
      post "/api/ai/deal_memo", params: { loan_id: loan.id }, as: :json
      expect(response).to have_http_status(:forbidden)
    end

    context "pro user" do
      before do
        user.update!(subscription_plan: "pro", subscription_status: "active")
      end

      it "returns 503 when API key not configured" do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with("ANTHROPIC_API_KEY").and_return(nil)
        allow(ENV).to receive(:fetch).and_call_original
        allow(ENV).to receive(:key?).and_call_original

        post "/api/ai/deal_memo", params: { loan_id: loan.id }, as: :json
        expect(response).to have_http_status(:service_unavailable)
      end
    end
  end

  describe "POST /api/ai/risk_narrative" do
    it "blocks free users with 403" do
      post "/api/ai/risk_narrative", params: { loan_id: loan.id }, as: :json
      expect(response).to have_http_status(:forbidden)
    end

    it "blocks solo users with 403" do
      user.update!(subscription_plan: "solo", subscription_status: "active")
      post "/api/ai/risk_narrative", params: { loan_id: loan.id }, as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "data isolation" do
    it "cannot access another user's loan" do
      user.update!(subscription_plan: "pro", subscription_status: "active")
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("ANTHROPIC_API_KEY").and_return("test-key")
      allow(ENV).to receive(:fetch).and_call_original
      allow(ENV).to receive(:key?).and_call_original

      other_loan = create(:loan, user: create(:user))
      post "/api/ai/deal_memo", params: { loan_id: other_loan.id }, as: :json
      expect(response).to have_http_status(:not_found)
    end
  end
end
