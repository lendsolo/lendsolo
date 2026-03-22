require "rails_helper"

RSpec.describe "Imports", type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  describe "GET /import" do
    it "returns success" do
      get new_import_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /import" do
    context "plan gating" do
      it "blocks free users" do
        csv = Tempfile.new(["test", ".csv"])
        csv.write("borrower,principal,rate,term,start_date\nJohn,50000,10,12,2025-01-01\n")
        csv.rewind

        post imports_path, params: { file: Rack::Test::UploadedFile.new(csv.path, "text/csv") }
        expect(response).to redirect_to(billing_path)
        csv.close!
      end

      it "allows solo users" do
        user.update!(subscription_plan: "solo", subscription_status: "active")
        csv = Tempfile.new(["test", ".csv"])
        csv.write("borrower,principal,rate,term,start_date\nJohn,50000,10,12,2025-01-01\n")
        csv.rewind

        post imports_path, params: { file: Rack::Test::UploadedFile.new(csv.path, "text/csv") }
        expect(response).to have_http_status(:ok)
        csv.close!
      end
    end

    it "rejects unsupported file types" do
      user.update!(subscription_plan: "solo", subscription_status: "active")
      txt = Tempfile.new(["test", ".txt"])
      txt.write("not a csv")
      txt.rewind

      post imports_path, params: { file: Rack::Test::UploadedFile.new(txt.path, "text/plain") }
      expect(response).to redirect_to(new_import_path)
      txt.close!
    end

    it "rejects missing file" do
      user.update!(subscription_plan: "solo", subscription_status: "active")
      post imports_path
      expect(response).to redirect_to(new_import_path)
    end
  end

  describe "POST /import/process" do
    it "ignores injected fields like user_id" do
      user.update!(subscription_plan: "solo", subscription_status: "active")
      other_user = create(:user)

      post process_import_path, params: {
        loans: [
          {
            borrower_name: "Alice",
            principal: "50000",
            annual_rate: "10",
            term_months: "12",
            start_date: "2025-01-01",
            user_id: other_user.id
          }
        ]
      }

      expect(response).to have_http_status(:ok)
      loan = user.loans.last
      expect(loan).to be_present
      expect(loan.user_id).to eq(user.id)
      expect(loan.user_id).not_to eq(other_user.id)
    end
  end
end
