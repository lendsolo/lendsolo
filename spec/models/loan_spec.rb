require "rails_helper"

RSpec.describe Loan, type: :model do
  describe "associations" do
    it "belongs to user" do
      loan = build(:loan)
      expect(loan).to respond_to(:user)
    end

    it "has many payments" do
      loan = build(:loan)
      expect(loan).to respond_to(:payments)
    end

    it "destroys associated payments" do
      loan = create(:loan)
      create(:payment, loan: loan)
      expect { loan.destroy }.to change(Payment, :count).by(-1)
    end
  end

  describe "validations" do
    it "is valid with valid attributes" do
      expect(build(:loan)).to be_valid
    end

    it "requires borrower_name" do
      expect(build(:loan, borrower_name: nil)).not_to be_valid
    end

    it "requires principal > 0" do
      expect(build(:loan, principal: 0)).not_to be_valid
      expect(build(:loan, principal: -1)).not_to be_valid
    end

    it "requires annual_rate between 0 and 100" do
      expect(build(:loan, annual_rate: -1)).not_to be_valid
      expect(build(:loan, annual_rate: 101)).not_to be_valid
      expect(build(:loan, annual_rate: 0)).to be_valid
      expect(build(:loan, annual_rate: 100)).to be_valid
    end

    it "requires term_months as positive integer up to 360" do
      expect(build(:loan, term_months: 0)).not_to be_valid
      expect(build(:loan, term_months: 361)).not_to be_valid
      expect(build(:loan, term_months: 1)).to be_valid
      expect(build(:loan, term_months: 360)).to be_valid
    end

    it "requires start_date" do
      expect(build(:loan, start_date: nil)).not_to be_valid
    end
  end

  describe "enums" do
    it "supports loan types" do
      %w[standard interest_only balloon].each do |type|
        expect(build(:loan, loan_type: type)).to be_valid
      end
    end

    it "supports statuses" do
      %w[active paid_off defaulted written_off].each do |status|
        expect(build(:loan, status: status)).to be_valid
      end
    end
  end

  describe "computed fields" do
    let(:loan) { create(:loan, principal: 100_000, annual_rate: 12, term_months: 12) }

    describe "#monthly_payment" do
      it "returns a positive number" do
        expect(loan.monthly_payment).to be > 0
      end
    end

    describe "#total_interest" do
      it "returns a positive number for standard loan with interest" do
        expect(loan.total_interest).to be > 0
      end
    end

    describe "#remaining_balance" do
      it "equals principal with no payments" do
        expect(loan.remaining_balance).to eq(100_000.0)
      end

      it "decreases after payments" do
        create(:payment, loan: loan, amount: loan.monthly_payment, date: Date.new(2025, 2, 1))
        expect(loan.remaining_balance).to be < 100_000.0
      end
    end

    describe "#repayment_percentage" do
      it "returns 0 with no payments" do
        expect(loan.repayment_percentage).to eq(0)
      end
    end

    describe "#next_payment_due" do
      it "returns date string for active loan" do
        expect(loan.next_payment_due).not_to be_nil
      end

      it "returns nil for paid off loan" do
        loan.update!(status: :paid_off)
        expect(loan.next_payment_due).to be_nil
      end
    end

    describe "#overdue?" do
      it "returns false for new loan within first payment window" do
        loan = create(:loan, start_date: Date.current)
        expect(loan.overdue?).to be false
      end

      it "returns true when payment is past due" do
        loan = create(:loan, start_date: 3.months.ago.to_date)
        expect(loan.overdue?).to be true
      end

      it "returns false for paid off loans" do
        loan = create(:loan, start_date: 3.months.ago.to_date, status: :paid_off)
        expect(loan.overdue?).to be false
      end
    end

    describe "#days_overdue" do
      it "returns 0 when not overdue" do
        loan = create(:loan, start_date: Date.current)
        expect(loan.days_overdue).to eq(0)
      end
    end

    describe "#expected_next_payment" do
      it "returns payment details for active loan" do
        expected = loan.expected_next_payment
        expect(expected).to include(:payment_number, :amount, :principal, :interest, :due_date)
      end

      it "returns nil for paid off loan" do
        loan.update!(status: :paid_off)
        expect(loan.expected_next_payment).to be_nil
      end
    end
  end

  describe "#refresh_payment_cache!" do
    let(:loan) { create(:loan, principal: 100_000, annual_rate: 12, term_months: 12) }

    it "populates cached fields on creation" do
      expect(loan.cached_next_payment_date).not_to be_nil
      expect(loan.cached_next_payment_amount).not_to be_nil
    end

    it "updates cached fields after a payment" do
      original_date = loan.cached_next_payment_date
      create(:payment, loan: loan, amount: loan.monthly_payment, date: loan.start_date + 1.month)
      loan.reload
      expect(loan.cached_next_payment_date).to be > original_date
    end

    it "sets cached fields to nil when loan is fully paid off" do
      loan.term_months.times do |i|
        create(:payment, loan: loan, amount: loan.monthly_payment, date: loan.start_date + (i + 1).months)
      end
      loan.reload
      expect(loan.cached_next_payment_date).to be_nil
      expect(loan.cached_next_payment_amount).to be_nil
    end
  end

  describe "#as_inertia_props" do
    it "returns a hash with all expected keys" do
      loan = create(:loan)
      props = loan.as_inertia_props(total_capital: 500_000)
      expected_keys = %i[id borrower_name principal annual_rate term_months loan_type
                         status start_date purpose collateral_description notes created_at
                         monthly_payment total_interest total_cost remaining_balance
                         payments_made_count total_paid interest_earned principal_returned
                         repayment_percentage next_payment_due days_since_start
                         capital_percentage overdue days_overdue expected_next_payment payments]
      expected_keys.each do |key|
        expect(props).to have_key(key)
      end
    end
  end
end
