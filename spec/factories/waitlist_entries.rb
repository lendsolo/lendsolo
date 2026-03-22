FactoryBot.define do
  factory :waitlist_entry do
    sequence(:email) { |n| "waitlist#{n}@example.com" }
    tier { "fund" }
  end
end
