class Expense < ApplicationRecord
  belongs_to :user
  belongs_to :recurring_parent, class_name: "Expense", optional: true
  has_many :generated_entries, class_name: "Expense", foreign_key: "recurring_parent_id"

  enum :category, {
    legal: "legal", filing: "filing", software: "software", marketing: "marketing",
    insurance: "insurance", travel: "travel", office: "office", other: "other"
  }

  FREQUENCIES = %w[monthly quarterly annually].freeze

  validates :description, :amount, :date, presence: true
  validates :amount, numericality: { greater_than: 0 }
  validates :frequency, inclusion: { in: FREQUENCIES }, allow_nil: true
  validates :frequency, presence: true, if: :recurring?
  validates :next_occurrence_date, presence: true, if: -> { recurring? && active? }

  scope :recurring, -> { where(recurring: true) }
  scope :one_time, -> { where(recurring: false) }
  scope :active_recurring, -> { where(recurring: true, active: true) }

  def generate_next_occurrence!
    return unless recurring? && active?
    return unless next_occurrence_date.present?

    generated_entries.create!(
      user: user,
      description: description,
      amount: amount,
      category: category,
      date: next_occurrence_date,
      recurring: false
    )

    update!(next_occurrence_date: advance_date(next_occurrence_date))
  end

  def stop_recurring!
    update!(active: false, next_occurrence_date: nil)
  end

  def resume_recurring!
    update!(active: true, next_occurrence_date: next_date_from(Date.current))
  end

  private

  def advance_date(from_date)
    case frequency
    when "monthly" then from_date + 1.month
    when "quarterly" then from_date + 3.months
    when "annually" then from_date + 1.year
    end
  end

  def next_date_from(from_date)
    case frequency
    when "monthly" then from_date + 1.month
    when "quarterly" then from_date + 3.months
    when "annually" then from_date + 1.year
    end
  end
end
