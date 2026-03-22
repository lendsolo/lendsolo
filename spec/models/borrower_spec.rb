require "rails_helper"

RSpec.describe Borrower, type: :model do
  let(:user) { User.create!(email: "lender@test.com", password: "password123", has_completed_onboarding: true) }

  describe "validations" do
    it "requires name" do
      borrower = user.borrowers.build(name: nil)
      expect(borrower).not_to be_valid
      expect(borrower.errors[:name]).to include("can't be blank")
    end

    it "is valid with just a name" do
      borrower = user.borrowers.build(name: "John Smith")
      expect(borrower).to be_valid
    end

    it "validates email format when present" do
      borrower = user.borrowers.build(name: "Jane", email: "not-an-email")
      expect(borrower).not_to be_valid
      expect(borrower.errors[:email]).to be_present
    end

    it "allows blank email" do
      borrower = user.borrowers.build(name: "Jane", email: "")
      expect(borrower).to be_valid
    end

    it "accepts valid email" do
      borrower = user.borrowers.build(name: "Jane", email: "jane@example.com")
      expect(borrower).to be_valid
    end
  end

  describe "TIN encryption" do
    it "encrypts TIN at rest" do
      borrower = user.borrowers.create!(name: "Test Borrower", tin: "123-45-6789")
      borrower.reload
      expect(borrower.tin).to eq("123456789")

      # Raw value in DB should be encrypted (not plaintext)
      raw = ActiveRecord::Base.connection.select_value(
        "SELECT tin FROM borrowers WHERE id = #{borrower.id}"
      )
      expect(raw).not_to eq("123456789")
      expect(raw).to be_present
    end

    it "strips non-numeric characters from TIN" do
      borrower = user.borrowers.create!(name: "Test", tin: "123-45-6789")
      expect(borrower.tin).to eq("123456789")
    end

    it "validates TIN is 9 digits" do
      borrower = user.borrowers.build(name: "Test", tin: "12345")
      expect(borrower).not_to be_valid
      expect(borrower.errors[:tin]).to include("must be 9 digits (SSN or EIN)")
    end

    it "allows blank TIN" do
      borrower = user.borrowers.build(name: "Test", tin: "")
      expect(borrower).to be_valid
    end
  end

  describe "scopes" do
    it "returns active borrowers by default" do
      active = user.borrowers.create!(name: "Active")
      archived = user.borrowers.create!(name: "Archived", archived: true)

      expect(Borrower.active).to include(active)
      expect(Borrower.active).not_to include(archived)
    end

    it "returns archived borrowers" do
      active = user.borrowers.create!(name: "Active")
      archived = user.borrowers.create!(name: "Archived", archived: true)

      expect(Borrower.archived).to include(archived)
      expect(Borrower.archived).not_to include(active)
    end
  end

  describe "archive/unarchive" do
    it "archives a borrower" do
      borrower = user.borrowers.create!(name: "Test")
      borrower.archive!
      expect(borrower.reload.archived).to be true
    end

    it "unarchives a borrower" do
      borrower = user.borrowers.create!(name: "Test", archived: true)
      borrower.unarchive!
      expect(borrower.reload.archived).to be false
    end
  end

  describe "associations" do
    it "prevents deletion when loans exist" do
      borrower = user.borrowers.create!(name: "Test")
      user.loans.create!(
        borrower: borrower,
        borrower_name: "Test",
        principal: 10000,
        annual_rate: 10,
        term_months: 12,
        start_date: Date.current
      )

      expect { borrower.destroy }.not_to change(Borrower, :count)
      expect(borrower.errors[:base]).to be_present
    end
  end

  describe "user scoping" do
    it "belongs to a user and another user cannot see it" do
      user2 = User.create!(email: "other@test.com", password: "password123", has_completed_onboarding: true)
      borrower = user.borrowers.create!(name: "My Borrower")

      expect(user.borrowers).to include(borrower)
      expect(user2.borrowers).not_to include(borrower)
    end
  end
end
