User.find_or_create_by!(email: "demo@lendsolo.com") do |user|
  user.password = "password123"
  user.password_confirmation = "password123"
  user.business_name = "Solo Capital LLC"
  user.total_capital = 150_000.00
  user.has_completed_onboarding = true
end

puts "Seed user created: demo@lendsolo.com / password123"
