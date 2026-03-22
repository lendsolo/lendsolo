require "rails_helper"

RSpec.describe Expense, type: :model do
  describe "associations" do
    it "belongs to user" do
      expect(build(:expense)).to respond_to(:user)
    end

    it "belongs to recurring_parent (optional)" do
      parent = create(:expense, :recurring)
      child = create(:expense, user: parent.user, recurring_parent: parent)
      expect(child.recurring_parent).to eq(parent)
    end

    it "has many generated_entries" do
      parent = create(:expense, :recurring)
      child = create(:expense, user: parent.user, recurring_parent: parent)
      expect(parent.generated_entries).to include(child)
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

    it "requires frequency when recurring" do
      expect(build(:expense, recurring: true, frequency: nil, next_occurrence_date: Date.current + 1.month)).not_to be_valid
    end

    it "requires next_occurrence_date when recurring" do
      expect(build(:expense, recurring: true, frequency: "monthly", next_occurrence_date: nil)).not_to be_valid
    end

    it "validates frequency inclusion" do
      expect(build(:expense, recurring: true, frequency: "weekly", next_occurrence_date: Date.current)).not_to be_valid
    end

    it "allows nil frequency for non-recurring expenses" do
      expect(build(:expense, recurring: false, frequency: nil)).to be_valid
    end
  end

  describe "enums" do
    it "supports all categories" do
      %w[legal filing software marketing insurance travel office other].each do |cat|
        expect(build(:expense, category: cat)).to be_valid
      end
    end
  end

  describe "scopes" do
    let(:user) { create(:user) }
    let!(:one_time) { create(:expense, user: user) }
    let!(:recurring_active) { create(:expense, :recurring, user: user) }
    let!(:recurring_stopped) { create(:expense, :stopped, user: user) }

    it ".recurring returns only recurring expenses" do
      expect(Expense.recurring).to include(recurring_active, recurring_stopped)
      expect(Expense.recurring).not_to include(one_time)
    end

    it ".one_time returns only non-recurring expenses" do
      expect(Expense.one_time).to include(one_time)
      expect(Expense.one_time).not_to include(recurring_active)
    end

    it ".active_recurring returns only active recurring expenses" do
      expect(Expense.active_recurring).to include(recurring_active)
      expect(Expense.active_recurring).not_to include(recurring_stopped, one_time)
    end
  end

  describe "#generate_next_occurrence!" do
    it "creates a new expense entry for monthly frequency" do
      expense = create(:expense, :recurring, next_occurrence_date: Date.current)
      expect { expense.generate_next_occurrence! }.to change(Expense, :count).by(1)

      generated = expense.generated_entries.last
      expect(generated.description).to eq(expense.description)
      expect(generated.amount).to eq(expense.amount)
      expect(generated.category).to eq(expense.category)
      expect(generated.date).to eq(Date.current)
      expect(generated.recurring).to be false
      expect(generated.recurring_parent_id).to eq(expense.id)
    end

    it "advances next_occurrence_date by 1 month for monthly" do
      original_date = Date.new(2026, 3, 15)
      expense = create(:expense, :recurring, frequency: "monthly", next_occurrence_date: original_date)
      expense.generate_next_occurrence!
      expect(expense.reload.next_occurrence_date).to eq(Date.new(2026, 4, 15))
    end

    it "advances next_occurrence_date by 3 months for quarterly" do
      original_date = Date.new(2026, 1, 1)
      expense = create(:expense, :quarterly, next_occurrence_date: original_date)
      expense.generate_next_occurrence!
      expect(expense.reload.next_occurrence_date).to eq(Date.new(2026, 4, 1))
    end

    it "advances next_occurrence_date by 1 year for annually" do
      original_date = Date.new(2026, 6, 15)
      expense = create(:expense, :annually, next_occurrence_date: original_date)
      expense.generate_next_occurrence!
      expect(expense.reload.next_occurrence_date).to eq(Date.new(2027, 6, 15))
    end

    it "does nothing if expense is not recurring" do
      expense = create(:expense)
      expect { expense.generate_next_occurrence! }.not_to change(Expense, :count)
    end

    it "does nothing if expense is not active" do
      expense = create(:expense, :stopped)
      expect { expense.generate_next_occurrence! }.not_to change(Expense, :count)
    end
  end

  describe "#stop_recurring!" do
    it "sets active to false and clears next_occurrence_date" do
      expense = create(:expense, :recurring)
      expense.stop_recurring!
      expense.reload
      expect(expense.active).to be false
      expect(expense.next_occurrence_date).to be_nil
    end
  end

  describe "#resume_recurring!" do
    it "sets active to true and calculates next_occurrence_date" do
      expense = create(:expense, :stopped, frequency: "monthly")
      expense.resume_recurring!
      expense.reload
      expect(expense.active).to be true
      expect(expense.next_occurrence_date).to eq(Date.current + 1.month)
    end
  end
end
