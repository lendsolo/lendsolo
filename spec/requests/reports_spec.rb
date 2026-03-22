require "rails_helper"

RSpec.describe "Reports", type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  describe "GET /reports" do
    it "returns success for any user (shows upgrade prompt)" do
      get reports_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "plan gating" do
    let(:loan) { create(:loan, user: user) }

    it "blocks free users from loan statement PDF" do
      get loan_statement_pdf_path(loan)
      expect(response).to redirect_to(reports_path)
    end

    it "blocks free users from amortization schedule PDF" do
      get loan_amortization_pdf_path(loan)
      expect(response).to redirect_to(reports_path)
    end

    it "blocks free users from year-end PDF" do
      get year_end_report_pdf_path(year: 2025)
      expect(response).to redirect_to(reports_path)
    end

    context "pro user" do
      before { user.update!(subscription_plan: "pro", subscription_status: "active") }

      it "allows loan statement PDF" do
        get loan_statement_pdf_path(loan)
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("application/pdf")
      end

      it "allows amortization schedule PDF" do
        get loan_amortization_pdf_path(loan)
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("application/pdf")
      end

      it "allows year-end PDF" do
        get year_end_report_pdf_path(year: 2025)
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to include("application/pdf")
      end
    end
  end

  describe "authentication" do
    it "redirects unauthenticated users" do
      sign_out user
      get reports_path
      expect(response).to redirect_to(new_user_session_path)
    end
  end
end
