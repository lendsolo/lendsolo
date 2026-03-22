FactoryBot.define do
  factory :email_log do
    user
    loan { nil }
    email_type { "payment_reminder" }
    recipient_email { "borrower@example.com" }
    payment_number { nil }
    reference_date { nil }
  end
end
