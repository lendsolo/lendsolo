require "rails_helper"

RSpec.describe "Edge Cases" do
  describe "Financial calculations" do
    describe "overpayment" do
      it "applies excess to principal" do
        loan = create(:loan, principal: 10_000, annual_rate: 12, term_months: 12, start_date: Date.new(2025, 1, 1))
        payment = loan.payments.create!(amount: 5000, date: Date.new(2025, 2, 1))
        expect(payment.principal_portion.to_f).to be > 0
        expect(payment.interest_portion.to_f).to be > 0
        expect(payment.principal_portion + payment.interest_portion).to be_within(0.01).of(5000)
      end
    end

    describe "payment on paid-off loan" do
      it "allows recording but assigns all to principal" do
        loan = create(:loan, principal: 3000, annual_rate: 0, term_months: 3, start_date: Date.new(2025, 1, 1))
        3.times { |i| loan.payments.create!(amount: 1000, date: Date.new(2025, 2, 1) + i.months) }
        expect(loan.reload.status).to eq("paid_off")

        # Record payment beyond schedule
        extra = loan.payments.create!(amount: 100, date: Date.new(2025, 6, 1))
        expect(extra.interest_portion.to_f).to eq(0)
        expect(extra.principal_portion.to_f).to eq(100)
      end
    end

    describe "0% interest rate loan" do
      let(:loan) { create(:loan, principal: 12_000, annual_rate: 0, term_months: 12, start_date: Date.new(2025, 1, 1)) }

      it "calculates monthly payment as principal / term" do
        expect(loan.monthly_payment).to eq(1000.0)
      end

      it "has zero total interest" do
        expect(loan.total_interest).to eq(0.0)
      end

      it "payment splits correctly with zero interest" do
        payment = loan.payments.create!(amount: 1000, date: Date.new(2025, 2, 1))
        expect(payment.interest_portion.to_f).to eq(0)
        expect(payment.principal_portion.to_f).to eq(1000)
      end
    end

    describe "high interest rate (36%)" do
      it "calculates without error" do
        loan = create(:loan, principal: 50_000, annual_rate: 36, term_months: 12)
        expect(loan.monthly_payment).to be > 0
        expect(loan.total_interest).to be > 0
      end
    end

    describe "single-month term loan" do
      it "repays full principal plus one month interest" do
        loan = create(:loan, principal: 10_000, annual_rate: 12, term_months: 1, start_date: Date.new(2025, 1, 1))
        # Monthly payment should be principal + 1 month interest
        expect(loan.monthly_payment).to be_within(1).of(10_100)
      end
    end

    describe "balloon payment at maturity" do
      it "has low payments then large final payment" do
        loan = create(:loan, :balloon, principal: 100_000, annual_rate: 12, term_months: 6)
        expected = loan.expected_next_payment
        # First payment should be interest-only
        expect(expected[:interest]).to be_within(1).of(1000)
        expect(expected[:principal]).to eq(0)
      end
    end

    describe "partial payment not covering interest" do
      it "assigns entire amount to interest with zero principal" do
        loan = create(:loan, principal: 100_000, annual_rate: 12, term_months: 12, start_date: Date.new(2025, 1, 1))
        # Interest portion is ~$1000, pay only $500
        payment = loan.payments.create!(amount: 500, date: Date.new(2025, 2, 1))
        expect(payment.interest_portion.to_f).to eq(500)
        expect(payment.principal_portion.to_f).to eq(0)
      end
    end
  end

  describe "Plan & billing edge cases" do
    describe "loan limit enforcement" do
      it "blocks creation at plan limit" do
        user = create(:user, :free) # 2 loan limit
        2.times { create(:loan, user: user, status: :active) }
        expect(user.can_create_loan_with_plan?).to be false
      end

      it "allows creation when some loans are paid off" do
        user = create(:user, :free)
        loan1 = create(:loan, user: user, status: :active)
        create(:loan, user: user, status: :paid_off)
        expect(user.can_create_loan_with_plan?).to be true
      end
    end

    describe "trial expiry" do
      it "can still view data after trial expires" do
        user = create(:user, :trial_expired)
        create(:loan, user: user)
        expect(user.loans.count).to eq(1)
      end

      it "effective_plan returns free after trial expires" do
        user = build(:user, :trial_expired)
        expect(user.effective_plan).to eq("free")
      end

      it "effective_plan returns solo during active trial" do
        user = build(:user, :on_trial)
        expect(user.effective_plan).to eq("solo")
      end
    end

    describe "plan downgrade scenario" do
      it "existing loans remain but new creation is blocked" do
        user = create(:user, :pro) # 25 loan limit
        10.times { create(:loan, user: user, status: :active) }

        # Downgrade to free (2 loan limit)
        user.update!(subscription_plan: "free", subscription_status: "incomplete")
        expect(user.loans.count).to eq(10) # still there
        expect(user.can_create_loan_with_plan?).to be false # but can't create more
      end
    end
  end

  describe "Data isolation" do
    let(:user_a) { create(:user) }
    let(:user_b) { create(:user) }

    before do
      @loan_a = create(:loan, user: user_a)
      @loan_b = create(:loan, user: user_b)
      create(:payment, loan: @loan_a)
      create(:payment, loan: @loan_b)
      create(:expense, user: user_a)
      create(:expense, user: user_b)
    end

    it "user A cannot see user B's loans" do
      expect(user_a.loans).to include(@loan_a)
      expect(user_a.loans).not_to include(@loan_b)
    end

    it "user A cannot see user B's expenses" do
      expect(user_a.expenses.count).to eq(1)
      expect(user_b.expenses.count).to eq(1)
    end

    it "user A's payments are scoped to their loans" do
      a_payments = Payment.joins(:loan).where(loans: { user_id: user_a.id })
      expect(a_payments.count).to eq(1)
      expect(a_payments.first.loan.user).to eq(user_a)
    end

    it "controller scoping prevents cross-tenant access", type: :request do
      sign_in user_a
      get loan_path(@loan_b)
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "Import edge cases" do
    let(:user) { create(:user, :solo) }

    before { sign_in user if respond_to?(:sign_in) }

    describe "column detection" do
      it "maps standard header names" do
        controller = ImportsController.new
        mappings = controller.send(:detect_mappings, ["Borrower Name", "Principal Amount", "Interest Rate", "Term Months", "Start Date"])
        expect(mappings).to include("borrower_name", "principal", "annual_rate", "term_months", "start_date")
      end
    end

    describe "parse_currency" do
      it "strips dollar signs and commas" do
        controller = ImportsController.new
        expect(controller.send(:parse_currency, "$50,000.00")).to eq(50_000.0)
      end

      it "returns nil for blank" do
        controller = ImportsController.new
        expect(controller.send(:parse_currency, "")).to be_nil
      end
    end

    describe "parse_loan_type" do
      it "detects interest_only" do
        controller = ImportsController.new
        expect(controller.send(:parse_loan_type, "Interest Only")).to eq("interest_only")
      end

      it "detects balloon" do
        controller = ImportsController.new
        expect(controller.send(:parse_loan_type, "Balloon")).to eq("balloon")
      end

      it "defaults to standard" do
        controller = ImportsController.new
        expect(controller.send(:parse_loan_type, "")).to eq("standard")
      end
    end

    describe "parse_status" do
      it "detects paid off" do
        controller = ImportsController.new
        expect(controller.send(:parse_status, "Paid")).to eq("paid_off")
      end

      it "detects defaulted" do
        controller = ImportsController.new
        expect(controller.send(:parse_status, "Default")).to eq("defaulted")
      end

      it "defaults to active" do
        controller = ImportsController.new
        expect(controller.send(:parse_status, "")).to eq("active")
      end
    end
  end
end
