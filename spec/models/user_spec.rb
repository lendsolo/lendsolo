require "rails_helper"

RSpec.describe User, type: :model do
  describe "associations" do
    it { expect(build(:user)).to respond_to(:loans) }
    it { expect(build(:user)).to respond_to(:expenses) }
    it { expect(build(:user)).to respond_to(:email_logs) }
    it { expect(build(:user)).to respond_to(:capital_transactions) }

    it "destroys associated loans" do
      user = create(:user)
      create(:loan, user: user)
      expect { user.destroy }.to change(Loan, :count).by(-1)
    end

    it "destroys associated expenses" do
      user = create(:user)
      create(:expense, user: user)
      expect { user.destroy }.to change(Expense, :count).by(-1)
    end

    it "destroys associated email_logs" do
      user = create(:user)
      create(:email_log, user: user)
      expect { user.destroy }.to change(EmailLog, :count).by(-1)
    end

    it "destroys associated capital_transactions" do
      user = create(:user)
      create(:capital_transaction, user: user)
      expect { user.destroy }.to change(CapitalTransaction, :count).by(-1)
    end
  end

  describe "validations" do
    it "requires email" do
      user = build(:user, email: "")
      expect(user).not_to be_valid
    end

    it "requires unique email" do
      create(:user, email: "dupe@example.com")
      user = build(:user, email: "dupe@example.com")
      expect(user).not_to be_valid
    end

    it "requires password" do
      user = build(:user, password: "")
      expect(user).not_to be_valid
    end
  end

  describe "enums" do
    it "supports all subscription plans" do
      %w[free solo pro fund].each do |plan|
        user = build(:user, subscription_plan: plan)
        expect(user.subscription_plan).to eq(plan)
      end
    end
  end

  describe "#loan_limit" do
    it "returns 2 for free" do
      expect(build(:user, :free).loan_limit).to eq(2)
    end

    it "returns 5 for solo" do
      expect(build(:user, :solo).loan_limit).to eq(5)
    end

    it "returns 25 for pro" do
      expect(build(:user, :pro).loan_limit).to eq(25)
    end

    it "returns infinity for fund" do
      expect(build(:user, :fund).loan_limit).to eq(Float::INFINITY)
    end
  end

  describe "#can_create_loan?" do
    it "allows when under limit" do
      user = create(:user, :free)
      create(:loan, user: user, status: :active)
      expect(user.can_create_loan?).to be true
    end

    it "blocks when at limit" do
      user = create(:user, :free)
      2.times { create(:loan, user: user, status: :active) }
      expect(user.can_create_loan?).to be false
    end

    it "does not count paid_off loans" do
      user = create(:user, :free)
      2.times { create(:loan, user: user, status: :active) }
      user.loans.first.update!(status: :paid_off)
      expect(user.can_create_loan?).to be true
    end
  end

  describe "trial logic" do
    describe "#on_trial?" do
      it "returns true during active trial" do
        user = build(:user, :on_trial)
        expect(user.on_trial?).to be true
      end

      it "returns false when trial expired" do
        user = build(:user, :trial_expired)
        expect(user.on_trial?).to be false
      end

      it "returns false for paid subscribers" do
        user = build(:user, :solo, trial_ends_at: 5.days.from_now)
        expect(user.on_trial?).to be false
      end

      it "returns false when no trial set" do
        user = build(:user, :free)
        expect(user.on_trial?).to be false
      end
    end

    describe "#trial_days_remaining" do
      it "returns remaining days during trial" do
        user = build(:user, :free, trial_ends_at: 7.days.from_now)
        expect(user.trial_days_remaining).to eq(7)
      end

      it "returns 0 when not on trial" do
        user = build(:user, :free)
        expect(user.trial_days_remaining).to eq(0)
      end
    end

    describe "#trial_expired?" do
      it "returns true when trial has ended" do
        user = build(:user, :trial_expired)
        expect(user.trial_expired?).to be true
      end

      it "returns false during active trial" do
        user = build(:user, :on_trial)
        expect(user.trial_expired?).to be false
      end
    end

    describe "#start_trial!" do
      it "sets trial_ends_at 14 days from now" do
        user = create(:user, :free)
        freeze_time do
          user.start_trial!
          expect(user.trial_ends_at).to be_within(1.second).of(14.days.from_now)
        end
      end

      it "does not restart trial if already set" do
        user = create(:user, :free, trial_ends_at: 3.days.from_now)
        original = user.trial_ends_at
        user.start_trial!
        expect(user.trial_ends_at).to eq(original)
      end

      it "does not start trial for paid subscribers" do
        user = create(:user, :pro)
        user.start_trial!
        expect(user.trial_ends_at).to be_nil
      end
    end
  end

  describe "#effective_plan" do
    it "returns subscription_plan for active subscribers" do
      expect(build(:user, :pro).effective_plan).to eq("pro")
    end

    it "returns 'solo' during active trial" do
      expect(build(:user, :on_trial).effective_plan).to eq("solo")
    end

    it "returns 'free' for expired trial" do
      expect(build(:user, :trial_expired).effective_plan).to eq("free")
    end

    it "returns 'free' for non-subscribed, non-trial users" do
      expect(build(:user, :free).effective_plan).to eq("free")
    end
  end

  describe "#active_subscription?" do
    it "returns true for paid plan with active status" do
      expect(build(:user, :pro).active_subscription?).to be true
    end

    it "returns false for free plan" do
      expect(build(:user, :free).active_subscription?).to be false
    end

    it "returns false for paid plan with non-active status" do
      user = build(:user, subscription_plan: "pro", subscription_status: "canceled")
      expect(user.active_subscription?).to be false
    end
  end

  describe "#can_create_loan_with_plan?" do
    it "uses effective plan limits" do
      user = create(:user, :on_trial) # trial gives solo (5 loan limit)
      4.times { create(:loan, user: user, status: :active) }
      expect(user.can_create_loan_with_plan?).to be true
    end

    it "blocks when over effective plan limit" do
      user = create(:user, :free) # free = 2 loan limit
      2.times { create(:loan, user: user, status: :active) }
      expect(user.can_create_loan_with_plan?).to be false
    end
  end

  describe "#computed_total_capital" do
    let(:user) { create(:user, total_capital: 0) }

    it "returns 0 with no transactions" do
      expect(user.computed_total_capital).to eq(0.0)
    end

    it "sums infusions and subtracts withdrawals" do
      create(:capital_transaction, :infusion, user: user, amount: 50_000)
      create(:capital_transaction, :infusion, user: user, amount: 20_000)
      create(:capital_transaction, :withdrawal, user: user, amount: 5_000)
      expect(user.computed_total_capital).to eq(65_000.0)
    end

    it "includes adjustments as additions" do
      create(:capital_transaction, :infusion, user: user, amount: 50_000)
      create(:capital_transaction, :adjustment, user: user, amount: 3_000)
      create(:capital_transaction, :withdrawal, user: user, amount: 10_000)
      expect(user.computed_total_capital).to eq(43_000.0)
    end
  end

  describe "#capital_balance_on" do
    let(:user) { create(:user, total_capital: 0) }

    it "returns balance up to a given date" do
      create(:capital_transaction, :infusion, user: user, amount: 50_000, date: Date.new(2026, 1, 1))
      create(:capital_transaction, :infusion, user: user, amount: 20_000, date: Date.new(2026, 2, 1))
      create(:capital_transaction, :withdrawal, user: user, amount: 5_000, date: Date.new(2026, 3, 1))

      expect(user.capital_balance_on(Date.new(2026, 1, 15))).to eq(50_000.0)
      expect(user.capital_balance_on(Date.new(2026, 2, 15))).to eq(70_000.0)
      expect(user.capital_balance_on(Date.new(2026, 3, 15))).to eq(65_000.0)
    end
  end

  describe "#sync_total_capital!" do
    it "updates the cached total_capital column" do
      user = create(:user, total_capital: 0)
      create(:capital_transaction, :infusion, user: user, amount: 75_000)
      create(:capital_transaction, :withdrawal, user: user, amount: 10_000)

      user.sync_total_capital!
      expect(user.reload.total_capital.to_f).to eq(65_000.0)
    end
  end
end
