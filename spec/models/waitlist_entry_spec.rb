require "rails_helper"

RSpec.describe WaitlistEntry, type: :model do
  describe "validations" do
    it "is valid with valid attributes" do
      expect(build(:waitlist_entry)).to be_valid
    end

    it "requires email" do
      expect(build(:waitlist_entry, email: nil)).not_to be_valid
    end

    it "requires valid email format" do
      expect(build(:waitlist_entry, email: "notanemail")).not_to be_valid
    end

    it "requires tier" do
      expect(build(:waitlist_entry, tier: nil)).not_to be_valid
    end

    it "prevents duplicate email+tier combinations" do
      create(:waitlist_entry, email: "test@example.com", tier: "fund")
      dupe = build(:waitlist_entry, email: "test@example.com", tier: "fund")
      expect(dupe).not_to be_valid
    end

    it "allows same email for different tiers" do
      create(:waitlist_entry, email: "test@example.com", tier: "fund")
      other = build(:waitlist_entry, email: "test@example.com", tier: "pro")
      expect(other).to be_valid
    end
  end
end
