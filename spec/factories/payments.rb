FactoryBot.define do
  factory :payment do
    loan
    amount { 1000 }
    date { Date.current }
  end
end
