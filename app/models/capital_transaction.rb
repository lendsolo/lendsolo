class CapitalTransaction < ApplicationRecord
  belongs_to :user

  TRANSACTION_TYPES = %w[infusion withdrawal adjustment].freeze

  validates :transaction_type, presence: true, inclusion: { in: TRANSACTION_TYPES }
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :date, presence: true

  scope :infusions, -> { where(transaction_type: "infusion") }
  scope :withdrawals, -> { where(transaction_type: "withdrawal") }
  scope :adjustments, -> { where(transaction_type: "adjustment") }
  scope :chronological, -> { order(date: :asc, created_at: :asc) }
  scope :reverse_chronological, -> { order(date: :desc, created_at: :desc) }
end
