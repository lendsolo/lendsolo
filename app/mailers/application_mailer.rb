class ApplicationMailer < ActionMailer::Base
  default from: -> { default_from_address }
  layout "mailer"

  private

  def default_from_address
    domain = ENV.fetch("RESEND_FROM_DOMAIN", "lendsolo.com")
    "noreply@#{domain}"
  end
end
