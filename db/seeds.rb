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
  expense.amount = 39
  expense.category = "software"
  expense.date = Date.current.beginning_of_month
  expense.recurring = true
  expense.frequency = "monthly"
  expense.next_occurrence_date = Date.current.beginning_of_month + 1.month
end

puts "Sample recurring expense created: LendSolo Pro Subscription ($39/mo)"
