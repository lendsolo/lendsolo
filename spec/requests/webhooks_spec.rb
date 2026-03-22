require "rails_helper"

RSpec.describe "Webhooks", type: :request do
  let(:webhook_secret) { "whsec_test_secret" }

  before do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with("STRIPE_WEBHOOK_SECRET", "whsec_placeholder").and_return(webhook_secret)
  end

  def stripe_webhook_payload(event_type, object_data)
    event = {
      id: "evt_test_#{SecureRandom.hex(8)}",
      type: event_type,
      data: { object: object_data }
    }
    payload = event.to_json
    timestamp = Time.now
    signature = Stripe::Webhook::Signature.compute_signature(
      timestamp, payload, webhook_secret
    )
    header = "t=#{timestamp.to_i},v1=#{signature}"
    [payload, header]
  end

  def post_webhook(event_type, object_data)
    payload, header = stripe_webhook_payload(event_type, object_data)
    post webhooks_stripe_path,
      params: payload,
      headers: {
        "HTTP_STRIPE_SIGNATURE" => header,
        "CONTENT_TYPE" => "application/json"
      }
  end

  describe "POST /webhooks/stripe" do
    describe "checkout.session.completed" do
      it "creates subscription for user" do
        user = create(:user, stripe_customer_id: "cus_test123")

        subscription = double(
          id: "sub_test123",
          items: double(data: [double(price: double(id: "price_solo_123"))]),
          metadata: { "plan" => "solo" }
        )
        allow(Stripe::Subscription).to receive(:retrieve).and_return(subscription)

        post_webhook("checkout.session.completed", {
          id: "cs_test123",
          customer: "cus_test123",
          subscription: "sub_test123",
          metadata: { "lendsolo_user_id" => user.id.to_s, "plan" => "solo" }
        })

        expect(response).to have_http_status(:ok)
        user.reload
        expect(user.subscription_plan).to eq("solo")
        expect(user.subscription_status).to eq("active")
        expect(user.stripe_subscription_id).to eq("sub_test123")
      end

      it "falls back to stripe_customer_id when metadata lookup fails" do
        user = create(:user, stripe_customer_id: "cus_fallback123")

        subscription = double(
          id: "sub_fb123",
          items: double(data: [double(price: double(id: "price_pro_123"))]),
          metadata: { "plan" => "pro" }
        )
        allow(Stripe::Subscription).to receive(:retrieve).and_return(subscription)

        post_webhook("checkout.session.completed", {
          id: "cs_fb123",
          customer: "cus_fallback123",
          subscription: "sub_fb123",
          metadata: { "plan" => "pro" }
        })

        expect(response).to have_http_status(:ok)
        user.reload
        expect(user.subscription_plan).to eq("pro")
      end
    end

    describe "customer.subscription.updated" do
      it "updates subscription plan and status" do
        user = create(:user, :solo, stripe_subscription_id: "sub_update123", stripe_customer_id: "cus_u123")

        post_webhook("customer.subscription.updated", {
          id: "sub_update123",
          customer: "cus_u123",
          status: "active",
          items: { data: [{ price: { id: "price_pro_456" } }] },
          metadata: { "plan" => "pro" }
        })

        expect(response).to have_http_status(:ok)
        user.reload
        expect(user.subscription_plan).to eq("pro")
        expect(user.subscription_status).to eq("active")
      end

      it "falls back to stripe_customer_id lookup" do
        user = create(:user, :solo, stripe_customer_id: "cus_fb_update")

        post_webhook("customer.subscription.updated", {
          id: "sub_new_456",
          customer: "cus_fb_update",
          status: "active",
          items: { data: [{ price: { id: "price_fund_789" } }] },
          metadata: { "plan" => "fund" }
        })

        expect(response).to have_http_status(:ok)
        user.reload
        expect(user.subscription_plan).to eq("fund")
      end
    end

    describe "customer.subscription.deleted" do
      it "downgrades user to free" do
        user = create(:user, :pro, stripe_subscription_id: "sub_del123", stripe_customer_id: "cus_d123")

        post_webhook("customer.subscription.deleted", {
          id: "sub_del123",
          customer: "cus_d123",
          status: "canceled"
        })

        expect(response).to have_http_status(:ok)
        user.reload
        expect(user.subscription_plan).to eq("free")
        expect(user.subscription_status).to eq("canceled")
        expect(user.stripe_subscription_id).to be_nil
      end
    end

    describe "invoice.payment_failed" do
      it "marks subscription as past_due" do
        user = create(:user, :solo, stripe_customer_id: "cus_fail123")

        post_webhook("invoice.payment_failed", {
          id: "in_fail123",
          customer: "cus_fail123"
        })

        expect(response).to have_http_status(:ok)
        user.reload
        expect(user.subscription_status).to eq("past_due")
      end
    end

    describe "unknown event type" do
      it "returns 200 (acknowledged but ignored)" do
        post_webhook("some.unknown.event", { id: "obj_123" })
        expect(response).to have_http_status(:ok)
      end
    end

    describe "invalid signature" do
      it "returns 400" do
        payload = { id: "evt_bad", type: "test", data: { object: {} } }.to_json
        post webhooks_stripe_path,
          params: payload,
          headers: {
            "HTTP_STRIPE_SIGNATURE" => "t=123,v1=badsignature",
            "CONTENT_TYPE" => "application/json"
          }
        expect(response).to have_http_status(:bad_request)
      end
    end

    describe "event for non-existent customer" do
      it "handles gracefully for subscription.deleted" do
        post_webhook("customer.subscription.deleted", {
          id: "sub_nonexistent",
          customer: "cus_nonexistent",
          status: "canceled"
        })
        expect(response).to have_http_status(:ok)
      end

      it "handles gracefully for invoice.payment_failed" do
        post_webhook("invoice.payment_failed", {
          id: "in_nonexistent",
          customer: "cus_nonexistent"
        })
        expect(response).to have_http_status(:ok)
      end
    end
  end
end
