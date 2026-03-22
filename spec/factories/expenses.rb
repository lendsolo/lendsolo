FactoryBot.define do
  factory :expense do
    user
    description { "Legal filing fee" }
    amount { 250 }
    date { Date.current }
    category { "legal" }

    trait :recurring do
      recurring { true }
      frequency { "monthly" }
      next_occurrence_date { Date.current + 1.month }
    end

    trait :quarterly do
      recurring { true }
      frequency { "quarterly" }
      next_occurrence_date { Date.current + 3.months }
    end

    trait :annually do
      recurring { true }
      frequency { "annually" }
      next_occurrence_date { Date.current + 1.year }
    end

    trait :stopped do
      recurring { true }
      frequency { "monthly" }
      active { false }
      next_occurrence_date { nil }
    end
  end
end
