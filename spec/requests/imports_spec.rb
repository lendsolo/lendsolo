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
end
