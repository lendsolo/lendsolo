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

    it "creates a recurring expense" do
      expect {
        post expenses_path, params: {
          expense: {
            description: "Software sub",
            amount: 39,
            date: Date.current.to_s,
            category: "software",
            recurring: "true",
            frequency: "monthly"
          }
        }
      }.to change(Expense, :count).by(1)

      expense = Expense.last
      expect(expense.recurring).to be true
      expect(expense.frequency).to eq("monthly")
      expect(expense.next_occurrence_date).to eq(Date.current + 1.month)
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

  describe "PATCH /expenses/:id/stop_recurring" do
    it "stops an active recurring expense" do
      expense = create(:expense, :recurring, user: user)
      patch stop_recurring_expense_path(expense)
      expect(response).to redirect_to(expenses_path)
      expense.reload
      expect(expense.active).to be false
      expect(expense.next_occurrence_date).to be_nil
    end
  end

  describe "PATCH /expenses/:id/resume_recurring" do
    it "resumes a stopped recurring expense" do
      expense = create(:expense, :stopped, user: user, frequency: "monthly")
      patch resume_recurring_expense_path(expense)
      expect(response).to redirect_to(expenses_path)
      expense.reload
      expect(expense.active).to be true
      expect(expense.next_occurrence_date).to eq(Date.current + 1.month)
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
