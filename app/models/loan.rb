class Loan < ApplicationRecord
  belongs_to :user
  has_many :payments, dependent: :destroy

  enum :loan_type, { standard: "standard", interest_only: "interest_only", balloon: "balloon" }
  enum :status, { active: "active", paid_off: "paid_off", defaulted: "defaulted", written_off: "written_off" }

  validates :borrower_name, :principal, :annual_rate, :term_months, :start_date, presence: true
  validates :principal, :annual_rate, numericality: { greater_than: 0 }
  validates :term_months, numericality: { greater_than: 0, only_integer: true }
end
