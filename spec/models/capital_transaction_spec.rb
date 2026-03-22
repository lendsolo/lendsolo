require "rails_helper"

RSpec.describe CapitalTransaction, type: :model do
  describe "associations" do
    it "belongs to a user" do
      txn = build(:capital_transaction)
      expect(txn.user).to be_present
    end
  end

  describe "validations" do
    it "requires transaction_type" do
      txn = build(:capital_transaction, transaction_type: nil)
      expect(txn).not_to be_valid
    end

    it "rejects invalid transaction_type" do
      txn = build(:capital_transaction, transaction_type: "gift")
      expect(txn).not_to be_valid
    end

    it "accepts valid transaction_types" do
      %w[infusion withdrawal adjustment].each do |type|
        txn = build(:capital_transaction, transaction_type: type)
        expect(txn).to be_valid
      end
    end

    it "requires amount" do
      txn = build(:capital_transaction, amount: nil)
      expect(txn).not_to be_valid
    end

    it "requires positive amount" do
      txn = build(:capital_transaction, amount: 0)
      expect(txn).not_to be_valid

      txn2 = build(:capital_transaction, amount: -100)
      expect(txn2).not_to be_valid
    end

    it "requires date" do
      txn = build(:capital_transaction, date: nil)
      expect(txn).not_to be_valid
    end
  end

  describe "scopes" do
    let(:user) { create(:user) }
    let!(:infusion) { create(:capital_transaction, :infusion, user: user) }
    let!(:withdrawal) { create(:capital_transaction, :withdrawal, user: user) }
    let!(:adjustment) { create(:capital_transaction, :adjustment, user: user) }

    it "filters by type" do
      expect(described_class.infusions).to eq([infusion])
      expect(described_class.withdrawals).to eq([withdrawal])
      expect(described_class.adjustments).to eq([adjustment])
    end
  end
end
