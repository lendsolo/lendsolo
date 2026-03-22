require "rails_helper"

RSpec.describe RecurringExpenseJob, type: :job do
  let(:user) { create(:user) }

  describe "#perform" do
    it "generates entries for due recurring expenses" do
      expense = create(:expense, :recurring, user: user, next_occurrence_date: Date.current)

      expect { described_class.new.perform }.to change(Expense, :count).by(1)
      expect(expense.reload.next_occurrence_date).to eq(Date.current + 1.month)
    end

    it "skips expenses with future next_occurrence_date" do
      create(:expense, :recurring, user: user, next_occurrence_date: Date.current + 1.day)

      expect { described_class.new.perform }.not_to change(Expense, :count)
    end

    it "skips inactive recurring expenses" do
      create(:expense, :stopped, user: user)

      expect { described_class.new.perform }.not_to change(Expense, :count)
    end

    it "catches up multiple missed periods" do
      expense = create(:expense, :recurring, user: user,
        frequency: "monthly",
        next_occurrence_date: Date.current - 2.months)

      # Should generate 3 entries: 2 months ago, 1 month ago, and this month
      expect { described_class.new.perform }.to change(Expense, :count).by(3)
      expect(expense.reload.next_occurrence_date).to be > Date.current
    end

    it "does not double-generate if run twice in one day" do
      create(:expense, :recurring, user: user, next_occurrence_date: Date.current)

      described_class.new.perform
      expect { described_class.new.perform }.not_to change(Expense, :count)
    end

    it "handles errors on individual expenses without stopping the job" do
      bad_expense = create(:expense, :recurring, user: user, next_occurrence_date: Date.current)
      good_expense = create(:expense, :recurring, user: user,
        description: "Good expense", next_occurrence_date: Date.current)

      # Make the first expense blow up by corrupting its frequency
      bad_expense.update_column(:frequency, nil)

      # Job should not raise and should still process the good expense
      expect { described_class.new.perform }.not_to raise_error
      expect(good_expense.reload.next_occurrence_date).to eq(Date.current + 1.month)
    end
  end
end
