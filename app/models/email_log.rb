class EmailLog < ApplicationRecord
  belongs_to :user
  belongs_to :loan, optional: true

  validates :email_type, :recipient_email, presence: true

  scope :for_type, ->(type) { where(email_type: type) }

  def self.already_sent?(user:, loan: nil, email_type:, payment_number: nil, reference_date: nil)
    where(
      user: user,
      loan: loan,
      email_type: email_type,
      payment_number: payment_number,
      reference_date: reference_date
    ).exists?
  end

  def self.record_send!(user:, loan: nil, email_type:, recipient_email:, payment_number: nil, reference_date: nil)
    create!(
      user: user,
      loan: loan,
      email_type: email_type,
      recipient_email: recipient_email,
      payment_number: payment_number,
      reference_date: reference_date
    )
  end
end
