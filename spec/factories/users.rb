FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    business_name { "Test Lending Co" }
    total_capital { 500_000 }
    has_completed_onboarding { true }
    subscription_plan { "free" }
    subscription_status { "incomplete" }
    borrower_notification_email { "borrower@example.com" }

    trait :free do
      subscription_plan { "free" }
      subscription_status { "incomplete" }
    end

    trait :solo do
      subscription_plan { "solo" }
      subscription_status { "active" }
    end

    trait :pro do
      subscription_plan { "pro" }
      subscription_status { "active" }
    end

    trait :fund do
      subscription_plan { "fund" }
      subscription_status { "active" }
    end

    trait :on_trial do
      subscription_plan { "free" }
      trial_ends_at { 14.days.from_now }
    end

    trait :trial_expired do
      subscription_plan { "free" }
      trial_ends_at { 1.day.ago }
    end

    trait :admin do
      admin { true }
    end

    trait :not_onboarded do
      has_completed_onboarding { false }
    end
  end
end
