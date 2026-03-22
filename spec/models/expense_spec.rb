require "rails_helper"

RSpec.describe Expense, type: :model do
  describe "associations" do
    it "belongs to user" do
      expect(build(:expense)).to respond_to(:user)
    end
  end

  describe "validations" do
    it "is valid with valid attributes" do
      expect(build(:expense)).to be_valid
    end

    it "requires description" do
      expect(build(:expense, description: nil)).not_to be_valid
    end

    it "requires amount > 0" do
      expect(build(:expense, amount: 0)).not_to be_valid
      expect(build(:expense, amount: -10)).not_to be_valid
    end

    it "requires date" do
      expect(build(:expense, date: nil)).not_to be_valid
    end
  end

  describe "enums" do
    it "supports all categories" do
      %w[legal filing software marketing insurance travel office other].each do |cat|
        expect(build(:expense, category: cat)).to be_valid
      end
    end
  end
end
