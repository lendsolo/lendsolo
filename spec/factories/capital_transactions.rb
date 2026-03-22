FactoryBot.define do
  factory :capital_transaction do
    user
    transaction_type { "infusion" }
    amount { 10_000 }
    date { Date.current }
    source { "Personal savings" }
    note { nil }

    trait :infusion do
      transaction_type { "infusion" }
    end

    trait :withdrawal do
      transaction_type { "withdrawal" }
    end

    trait :adjustment do
      transaction_type { "adjustment" }
    end
  end
end
