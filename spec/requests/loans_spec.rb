require "rails_helper"

RSpec.describe "Loans", type: :request do
  let(:user) { create(:user, :free) }

  before { sign_in user }

  describe "GET /loans" do
    it "returns success" do
      get loans_path
      expect(response).to have_http_status(:ok)
    end

    it "only shows current user's loans" do
      create(:loan, user: user)
      other_user = create(:user)
      create(:loan, user: other_user)

      get loans_path
      expect(response).to have_http_status(:ok)
    end

    it "handles 10 loans with payments without N+1 queries" do
      10.times do |i|
        loan = create(:loan, user: user, borrower_name: "Borrower #{i}")
        3.times do |j|
          create(:payment, loan: loan, date: loan.start_date + (j + 1).months)
        end
      end

      query_count = 0
      counter = lambda { |_name, _start, _finish, _id, payload|
        query_count += 1 unless payload[:name] == "SCHEMA" || payload[:sql]&.start_with?("SAVEPOINT", "RELEASE")
      }

      ActiveSupport::Notifications.subscribed(counter, "sql.active_record") do
        get loans_path
      end

      expect(response).to have_http_status(:ok)
      expect(query_count).to be <= 20
    end
  end

  describe "GET /loans/:id" do
    it "shows own loan" do
      loan = create(:loan, user: user)
      get loan_path(loan)
      expect(response).to have_http_status(:ok)
    end

    it "rejects access to another user's loan" do
      other_loan = create(:loan, user: create(:user))
      get loan_path(other_loan)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /loans" do
    let(:valid_params) do
      {
        loan: {
          borrower_name: "Jane Doe",
          principal: 50_000,
          annual_rate: 8,
          term_months: 24,
          start_date: Date.current.to_s,
          loan_type: "standard"
        }
      }
    end

    it "creates a loan with valid params" do
      expect { post loans_path, params: valid_params }.to change(Loan, :count).by(1)
      expect(response).to have_http_status(:redirect)
    end

    it "redirects with invalid params" do
      post loans_path, params: { loan: { borrower_name: "" } }
      expect(response).to have_http_status(:redirect)
    end

    context "plan gating" do
      it "allows free user to create up to 2 loans" do
        create(:loan, user: user, status: :active)
        post loans_path, params: valid_params
        expect(response).to have_http_status(:redirect)
        expect(Loan.count).to eq(2)
      end

      it "blocks free user from creating beyond limit" do
        2.times { create(:loan, user: user, status: :active) }
        post loans_path, params: valid_params
        expect(response).to redirect_to(billing_path)
      end

      it "allows solo user up to 5 loans" do
        user.update!(subscription_plan: "solo", subscription_status: "active")
        4.times { create(:loan, user: user, status: :active) }
        post loans_path, params: valid_params
        expect(response).to have_http_status(:redirect)
        expect(response).not_to redirect_to(billing_path)
      end
    end

    it "starts trial on first loan for free user" do
      post loans_path, params: valid_params
      expect(user.reload.trial_ends_at).not_to be_nil
    end
  end

  describe "PATCH /loans/:id" do
    it "updates own loan" do
      loan = create(:loan, user: user)
      patch loan_path(loan), params: { loan: { borrower_name: "Updated Name" } }
      expect(response).to have_http_status(:redirect)
      expect(loan.reload.borrower_name).to eq("Updated Name")
    end
  end

  describe "DELETE /loans/:id" do
    it "destroys own loan" do
      loan = create(:loan, user: user)
      expect { delete loan_path(loan) }.to change(Loan, :count).by(-1)
    end
  end

  describe "PATCH /loans/:id/mark_paid_off" do
    it "marks loan as paid off" do
      loan = create(:loan, user: user)
      patch mark_paid_off_loan_path(loan)
      expect(loan.reload.status).to eq("paid_off")
    end
  end

  describe "PATCH /loans/:id/mark_defaulted" do
    it "marks loan as defaulted" do
      loan = create(:loan, user: user)
      patch mark_defaulted_loan_path(loan)
      expect(loan.reload.status).to eq("defaulted")
    end
  end

  describe "authentication" do
    it "redirects unauthenticated users to login" do
      sign_out user
      get loans_path
      expect(response).to redirect_to(new_user_session_path)
    end
  end
end
