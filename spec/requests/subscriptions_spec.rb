require "rails_helper"

RSpec.describe "Subscriptions", type: :request do
  let(:user) { create(:user, :free) }

  before { sign_in user }

  describe "POST /billing/subscribe" do
    context "when Stripe price ID is missing" do
      it "returns an error instead of creating a checkout session" do
        allow(ENV).to receive(:fetch).and_call_original
        allow(ENV).to receive(:fetch).with("STRIPE_SOLO_PRICE_ID", "").and_return("")

        post billing_subscribe_path, params: { plan: "solo" }
        expect(response).to redirect_to(billing_path)
        follow_redirect!
      end
    end

    context "when Stripe price ID is present" do
      it "creates a checkout session" do
        allow(ENV).to receive(:fetch).and_call_original
        allow(ENV).to receive(:fetch).with("STRIPE_SOLO_PRICE_ID", "").and_return("price_1ABC123")

        stripe_customer = double(id: "cus_test123")
        allow(Stripe::Customer).to receive(:create).and_return(stripe_customer)

        stripe_session = double(url: "https://checkout.stripe.com/session/test", id: "cs_test123")
        allow(Stripe::Checkout::Session).to receive(:create).and_return(stripe_session)

        post billing_subscribe_path, params: { plan: "solo" }
        expect(response).to have_http_status(:ok)
      end
    end

    it "rejects invalid plan" do
      post billing_subscribe_path, params: { plan: "invalid" }
      expect(response).to redirect_to(billing_path)
    end
  end
end
