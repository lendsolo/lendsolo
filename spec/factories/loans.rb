FactoryBot.define do
  factory :loan do
    user
    borrower_name { "John Doe" }
    principal { 100_000 }
    annual_rate { 10 }
    term_months { 12 }
    start_date { Date.new(2025, 1, 1) }
    loan_type { "standard" }
    status { "active" }

    trait :interest_only do
      loan_type { "interest_only" }
    end

    trait :balloon do
      loan_type { "balloon" }
    end

    trait :paid_off do
      status { "paid_off" }
    end

    trait :defaulted do
      status { "defaulted" }
    end

    trait :with_payments do
      after(:create) do |loan|
        3.times do |i|
          create(:payment, loan: loan, date: loan.start_date + (i + 1).months)
        end
      end
    end
  end
end
