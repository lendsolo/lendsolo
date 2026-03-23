class Borrower < ApplicationRecord
  belongs_to :user
  has_many :loans, dependent: :restrict_with_error

  encrypts :tin

  validates :name, presence: true
  validates :user_id, presence: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true

  validate :tin_format, if: -> { tin.present? }

  scope :active, -> { where(archived: false) }
  scope :archived, -> { where(archived: true) }

  before_validation :normalize_tin

  def tin_masked
    return nil if tin.blank?
    "•••-••-#{tin.last(4)}"
  end

  def full_address
    [address_line1, city, state, zip].select(&:present?).join(", ")
  end

  def archive!
    update!(archived: true)
  end

  def unarchive!
    update!(archived: false)
  end

  private

  def normalize_tin
    self.tin = tin.gsub(/\D/, "") if tin.present?
  end

  def tin_format
    unless tin.match?(/\A\d{9}\z/)
      errors.add(:tin, "must be 9 digits (SSN or EIN)")
    end
  end
end
