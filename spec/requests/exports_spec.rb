require "rails_helper"

RSpec.describe "Exports", type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  describe "GET /exports" do
    it "returns success for any user (preview page)" do
      get exports_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "plan gating" do
    it "blocks free users from PDF export" do
      get export_pdf_path
      expect(response).to redirect_to(billing_path)
    end

    it "blocks free users from CSV export" do
      get export_csv_path
      expect(response).to redirect_to(billing_path)
    end

    it "blocks free users from QBO export" do
      get export_qbo_path
      expect(response).to redirect_to(billing_path)
    end

    it "blocks free users from expenses CSV export" do
      get export_expenses_csv_path
      expect(response).to redirect_to(billing_path)
    end

    context "pro user" do
      before { user.update!(subscription_plan: "pro", subscription_status: "active") }

      it "allows PDF export" do
        get export_pdf_path
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("application/pdf")
      end

      it "allows CSV export" do
        get export_csv_path
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("text/csv")
      end

      it "allows QBO export" do
        get export_qbo_path
        expect(response).to have_http_status(:ok)
      end

      it "allows expenses CSV export" do
        get export_expenses_csv_path
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("text/csv")
      end
    end
  end

  describe "authentication" do
    it "redirects unauthenticated users" do
      sign_out user
      get exports_path
      expect(response).to redirect_to(new_user_session_path)
    end
  end
end
