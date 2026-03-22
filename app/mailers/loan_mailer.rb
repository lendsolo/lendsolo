class LoanMailer < ApplicationMailer
  include ActionView::Helpers::NumberHelper

  # ── 1. Payment Reminder ────────────────────────────────────────────────────
  # Sent X days before a payment is due
  def payment_reminder(loan, payment_number)
    @loan = loan
    @user = loan.user
    @business_name = @user.business_name
    @payment_number = payment_number

    schedule = amortization_schedule(loan)
    @expected = schedule[payment_number - 1] if payment_number <= schedule.length
    @due_date = loan.start_date >> payment_number
    @remaining_balance = loan.remaining_balance
    @amount_due = @expected ? @expected[:payment].to_f : loan.monthly_payment

    recipient = @user.borrower_notification_email.presence || @loan.display_borrower_name
    from_name = @business_name.presence || "LendSolo"

    mail(
      to: recipient,
      from: "#{from_name} <#{default_from_address}>",
      subject: "Payment Reminder — $#{format_currency(@amount_due)} due #{@due_date.strftime('%B %d, %Y')}"
    )
  end

  # ── 2. Late Payment Notice ─────────────────────────────────────────────────
  # Sent X days after a missed due date
  def late_payment_notice(loan, days_overdue)
    @loan = loan
    @user = loan.user
    @business_name = @user.business_name
    @days_overdue = days_overdue

    payment_number = loan.payments_made_count + 1
    schedule = amortization_schedule(loan)
    @expected = schedule[payment_number - 1] if payment_number <= schedule.length
    @due_date = loan.next_payment_due_date
    @amount_due = @expected ? @expected[:payment].to_f : loan.monthly_payment
    @remaining_balance = loan.remaining_balance

    recipient = @user.borrower_notification_email.presence || @loan.display_borrower_name
    from_name = @business_name.presence || "LendSolo"

    mail(
      to: recipient,
      from: "#{from_name} <#{default_from_address}>",
      subject: "Payment Overdue — #{@days_overdue} day#{'s' if @days_overdue != 1} past due"
    )
  end

  # ── 3. Payment Receipt ─────────────────────────────────────────────────────
  # Sent immediately when a payment is recorded
  def payment_receipt(payment)
    @payment = payment
    @loan = payment.loan
    @user = @loan.user
    @business_name = @user.business_name
    @remaining_balance = @loan.remaining_balance
    @next_due = @loan.next_payment_due_date

    recipient = @user.borrower_notification_email.presence || @loan.display_borrower_name
    from_name = @business_name.presence || "LendSolo"

    mail(
      to: recipient,
      from: "#{from_name} <#{default_from_address}>",
      subject: "Payment Received — $#{format_currency(@payment.amount)} for loan to #{@loan.display_borrower_name}"
    )
  end

  # ── 4. Monthly Portfolio Summary ───────────────────────────────────────────
  # Sent to the lender on the 1st of each month
  def monthly_portfolio_summary(user)
    @user = user
    @business_name = user.business_name

    last_month_start = 1.month.ago.beginning_of_month.to_date
    last_month_end = 1.month.ago.end_of_month.to_date
    this_month_start = Date.current.beginning_of_month
    this_month_end = Date.current.end_of_month

    # Last month stats
    last_month_payments = Payment.joins(:loan)
                                 .where(loans: { user_id: user.id })
                                 .where(date: last_month_start..last_month_end)

    @payments_received_count = last_month_payments.count
    @payments_received_total = last_month_payments.sum(:amount).to_f
    @interest_earned = last_month_payments.sum(:interest_portion).to_f
    @principal_returned = last_month_payments.sum(:principal_portion).to_f

    # Current state
    @active_loans = user.loans.where(status: :active)
    @overdue_loans = @active_loans.select(&:overdue?)
    @total_deployed = @active_loans.sum(:principal).to_f
    @total_outstanding = @active_loans.sum { |l| l.remaining_balance }

    # Upcoming payments this month
    @upcoming_payments = @active_loans.filter_map { |loan|
      next_due = loan.next_payment_due_date
      if next_due && next_due >= this_month_start && next_due <= this_month_end
        { loan: loan, due_date: next_due, amount: loan.monthly_payment }
      end
    }.sort_by { |p| p[:due_date] }

    @month_name = last_month_start.strftime("%B %Y")

    mail(
      to: user.email,
      subject: "Monthly Portfolio Summary — #{@month_name}"
    )
  end

  # ── Preview (sends test to lender) ─────────────────────────────────────────
  def preview_email(user, email_type)
    @user = user
    @business_name = user.business_name
    @email_type = email_type
    @preview = true

    mail(
      to: user.email,
      subject: "LendSolo — Test Email Preview (#{email_type.humanize})"
    )
  end

  private

  def amortization_schedule(loan)
    Calculations::AmortizationCalculator.call(
      principal: loan.principal,
      annual_rate: loan.annual_rate,
      term_months: loan.term_months,
      start_date: loan.start_date,
      loan_type: loan.loan_type.to_sym
    ).schedule
  end

  def format_currency(amount)
    number_with_precision(amount, precision: 2, delimiter: ",")
  end

  def default_from_address
    domain = ENV.fetch("RESEND_FROM_DOMAIN", "lendsolo.com")
    "noreply@#{domain}"
  end
end
