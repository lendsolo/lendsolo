class LoanDocument < ApplicationRecord
  belongs_to :loan

  DOCUMENT_TYPES = %w[promissory_note deed_of_trust title_insurance hazard_insurance personal_guarantee].freeze
  STATUSES = %w[on_file missing expired].freeze

  validates :document_type, presence: true, inclusion: { in: DOCUMENT_TYPES }
  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :document_type, uniqueness: { scope: :loan_id }
  validates :notes, length: { maximum: 500 }
end
