require "rails_helper"

RSpec.describe "Borrowers", type: :request do
  let(:user) { User.create!(email: "lender@test.com", password: "password123", has_completed_onboarding: true) }
  let(:other_user) { User.create!(email: "other@test.com", password: "password123", has_completed_onboarding: true) }

  before { sign_in user }

  describe "GET /borrowers" do
    it "lists the current user's borrowers" do
      user.borrowers.create!(name: "Alice")
      user.borrowers.create!(name: "Bob")
      other_user.borrowers.create!(name: "Eve")

      get borrowers_path, headers: { "Accept" => "application/json" }
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      names = body.map { |b| b["name"] }
      expect(names).to contain_exactly("Alice", "Bob")
      expect(names).not_to include("Eve")
    end
  end

  describe "GET /borrowers/:id" do
    it "shows a borrower belonging to the user" do
      borrower = user.borrowers.create!(name: "Alice")
      get borrower_path(borrower), headers: { "Accept" => "application/json" }
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["name"]).to eq("Alice")
    end

    it "rejects access to another user's borrower" do
      borrower = other_user.borrowers.create!(name: "Eve")
      # Devise redirects or raises RecordNotFound
      begin
        get borrower_path(borrower)
        expect(response.status).to be_in([302, 404])
      rescue ActiveRecord::RecordNotFound
        # Expected behavior
      end
    end
  end

  describe "POST /borrowers" do
    it "creates a borrower with valid params" do
      expect {
        post borrowers_path, params: { borrower: { name: "New Borrower", email: "nb@test.com" } }
      }.to change(Borrower, :count).by(1)

      expect(response).to have_http_status(:redirect)
    end

    it "rejects a borrower without a name" do
      expect {
        post borrowers_path, params: { borrower: { name: "" } }
      }.not_to change(Borrower, :count)
    end

    it "creates a borrower and returns JSON" do
      post borrowers_path, params: { borrower: { name: "JSON Borrower" } },
                           headers: { "Accept" => "application/json" }
      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body["id"]).to be_present
      expect(body["name"]).to eq("JSON Borrower")
    end
  end

  describe "PATCH /borrowers/:id" do
    it "updates a borrower and syncs loan borrower_name" do
      borrower = user.borrowers.create!(name: "Old Name")
      loan = user.loans.create!(
        borrower: borrower,
        borrower_name: "Old Name",
        principal: 10000,
        annual_rate: 10,
        term_months: 12,
        start_date: Date.current
      )

      patch borrower_path(borrower), params: { borrower: { name: "New Name" } }
      expect(response).to have_http_status(:redirect)
      expect(borrower.reload.name).to eq("New Name")
      expect(loan.reload.borrower_name).to eq("New Name")
    end
  end

  describe "PATCH /borrowers/:id/archive" do
    it "archives a borrower" do
      borrower = user.borrowers.create!(name: "Alice")
      patch archive_borrower_path(borrower)
      expect(borrower.reload.archived).to be true
    end
  end

  describe "PATCH /borrowers/:id/unarchive" do
    it "unarchives a borrower" do
      borrower = user.borrowers.create!(name: "Alice", archived: true)
      patch unarchive_borrower_path(borrower)
      expect(borrower.reload.archived).to be false
    end
  end
end
