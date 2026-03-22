FactoryBot.define do
  factory :expense do
    user
    description { "Legal filing fee" }
    amount { 250 }
    date { Date.current }
    category { "legal" }
  end
end
