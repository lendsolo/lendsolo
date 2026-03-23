User.find_or_create_by!(email: "demo@lendsolo.com") do |user|
  user.password = "password123"
  user.password_confirmation = "password123"
  user.business_name = "Solo Capital LLC"
  user.total_capital = 150_000.00
  user.has_completed_onboarding = true
end

puts "Seed user created: demo@lendsolo.com / password123"

# Sample recurring expense
demo_user = User.find_by!(email: "demo@lendsolo.com")
demo_user.expenses.find_or_create_by!(description: "LendSolo Pro Subscription") do |expense|
  expense.amount = 49
  expense.category = "software"
  expense.date = Date.current.beginning_of_month
  expense.recurring = true
  expense.frequency = "monthly"
  expense.next_occurrence_date = Date.current.beginning_of_month + 1.month
end

puts "Sample recurring expense created: LendSolo Pro Subscription ($49/mo)"

# Sample capital transactions
demo_user.capital_transactions.delete_all
demo_user.capital_transactions.create!(
  transaction_type: "infusion",
  amount: 60_000,
  date: 3.months.ago.to_date,
  source: "Personal savings",
  note: "Initial capital to start lending business"
)
demo_user.capital_transactions.create!(
  transaction_type: "infusion",
  amount: 20_000,
  date: 1.month.ago.to_date,
  source: "Sold index fund position",
  note: "Liquidated VTSAX position to increase lending capital"
)
demo_user.capital_transactions.create!(
  transaction_type: "withdrawal",
  amount: 5_000,
  date: 2.weeks.ago.to_date,
  source: "Owner draw",
  note: "Monthly owner draw"
)
demo_user.sync_total_capital!

puts "Sample capital transactions created: $60k + $20k - $5k = $75k total capital"

# Ensure any existing loans have loan documents
demo_user.loans.each do |loan|
  LoanDocument::DOCUMENT_TYPES.each do |doc_type|
    loan.loan_documents.find_or_create_by!(document_type: doc_type) do |doc|
      doc.status = "missing"
    end
  end
end

puts "Loan documents ensured for all demo loans"
