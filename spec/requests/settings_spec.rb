require "rails_helper"

RSpec.describe "Settings", type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  describe "DELETE /settings/reset_data" do
    before do
      create(:loan, user: user)
    end

    it "returns error without confirmation param" do
      delete "/settings/reset_data"
      expect(response).to redirect_to(settings_path)
      follow_redirect!
      expect(user.loans.count).to eq(1)
    end

    it "returns error with wrong confirmation" do
      delete "/settings/reset_data", params: { confirmation: "WRONG" }
      expect(response).to redirect_to(settings_path)
      follow_redirect!
      expect(user.loans.count).to eq(1)
    end

    it "succeeds with correct confirmation and destroys data" do
      delete "/settings/reset_data", params: { confirmation: "DELETE" }
      expect(response).to redirect_to(settings_path)
      expect(user.loans.count).to eq(0)
    end
  end
end
