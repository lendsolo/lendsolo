class Payment < ApplicationRecord
  belongs_to :loan

  validates :amount, :date, :principal_portion, :interest_portion, presence: true
  validates :amount, :principal_portion, :interest_portion, numericality: { greater_than_or_equal_to: 0 }
  validates :late_fee, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
end
