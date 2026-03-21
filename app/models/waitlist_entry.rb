class WaitlistEntry < ApplicationRecord
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :tier, presence: true
  validates :email, uniqueness: { scope: :tier, message: "is already on the waitlist" }
end
