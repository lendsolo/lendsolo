require "rails_helper"
require "rake"

RSpec.describe "data:migrate_borrowers" do
  before(:all) do
    Rails.application.load_tasks
  end

  let(:user) { User.create!(email: "lender@test.com", password: "password123", has_completed_onboarding: true) }

  def create_loan(user, name, **overrides)
    user.loans.create!(
      {
        borrower_name: name,
        principal: 10000,
        annual_rate: 10,
        term_months: 12,
        start_date: Date.current
      }.merge(overrides)
    )
  end

  after do
    # Re-enable the rake task for subsequent tests
    Rake::Task["data:migrate_borrowers"].reenable
  end

  it "creates borrower records from loan borrower_name strings" do
    create_loan(user, "Alice")
    create_loan(user, "Bob")

    expect {
      Rake::Task["data:migrate_borrowers"].invoke
    }.to change(Borrower, :count).by(2)

    expect(user.borrowers.pluck(:name)).to contain_exactly("Alice", "Bob")
    expect(user.loans.where(borrower_id: nil).count).to eq(0)
  end

  it "deduplicates case-insensitively" do
    create_loan(user, "John Smith")
    create_loan(user, "john smith")
    create_loan(user, " John Smith ")

    expect {
      Rake::Task["data:migrate_borrowers"].invoke
    }.to change(Borrower, :count).by(1)

    borrower = user.borrowers.first
    expect(borrower.name).to eq("John Smith")
    expect(user.loans.where(borrower_id: borrower.id).count).to eq(3)
  end

  it "handles blank borrower_name by creating Unknown Borrower" do
    loan = create_loan(user, "Placeholder")
    loan.update_columns(borrower_name: "", borrower_id: nil)

    Rake::Task["data:migrate_borrowers"].invoke

    expect(user.borrowers.pluck(:name)).to include("Unknown Borrower")
    expect(loan.reload.borrower_id).to be_present
  end

  it "ensures all loans have borrower_id after migration" do
    create_loan(user, "Alice")
    create_loan(user, "Bob")
    create_loan(user, "Alice")

    Rake::Task["data:migrate_borrowers"].invoke

    expect(Loan.where(borrower_id: nil).count).to eq(0)
  end
end
