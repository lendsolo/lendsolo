class Expense < ApplicationRecord
  belongs_to :user

  enum :category, {
    legal: "legal", filing: "filing", software: "software", marketing: "marketing",
    insurance: "insurance", travel: "travel", office: "office", other: "other"
  }

  validates :description, :amount, :date, presence: true
  validates :amount, numericality: { greater_than: 0 }
end
