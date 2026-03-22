require "rails_helper"

RSpec.describe "Expenses", type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  describe "GET /expenses" do
    it "returns success" do
      get expenses_path
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /expenses" do
    it "creates an expense with valid params" do
      expect {
        post expenses_path, params: { expense: { description: "Filing fee", amount: 100, date: Date.current.to_s, category: "filing" } }
      }.to change(Expense, :count).by(1)
      expect(response).to redirect_to(expenses_path)
    end

    it "rejects invalid params" do
      post expenses_path, params: { expense: { description: "", amount: 0, date: "" } }
      expect(response).to redirect_to(expenses_path)
    end
  end

  describe "DELETE /expenses/:id" do
    it "destroys own expense" do
      expense = create(:expense, user: user)
      expect { delete expense_path(expense) }.to change(Expense, :count).by(-1)
    end

    it "cannot destroy another user's expense" do
      other_expense = create(:expense, user: create(:user))
      delete expense_path(other_expense)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "GET /expenses/export_csv" do
    it "blocks free users" do
      get export_csv_expenses_path
      expect(response).to redirect_to(billing_path)
    end

    it "allows pro users" do
      user.update!(subscription_plan: "pro", subscription_status: "active")
      get export_csv_expenses_path
      expect(response).to have_http_status(:ok)
      expect(response.content_type).to include("text/csv")
    end
  end
end
