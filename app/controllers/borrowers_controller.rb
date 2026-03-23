class BorrowersController < ApplicationController
  before_action :set_borrower, only: %i[show edit update archive unarchive update_notes reveal_tin interest_statement email_interest_statement]
  before_action :enforce_pro_gate!, only: %i[interest_statement email_interest_statement]

  def index
    scope = params[:show_archived] == "true" ? current_user.borrowers : current_user.borrowers.active
    borrowers = scope.order(:name).includes(loans: :payments)

    respond_to do |format|
      format.json { render json: borrowers.map { |b| serialize_borrower_summary(b) } }
      format.any do
        render inertia: "Borrowers/Index", props: {
          borrowers: borrowers.map { |b| serialize_borrower_summary(b) },
          show_archived: params[:show_archived] == "true"
        }
      end
    end
  end

  def show
    loans = @borrower.loans.includes(:payments).order(created_at: :desc)
    total_capital = current_user.total_capital

    # Combined payment history across all loans
    all_payments = Payment.joins(:loan)
                          .where(loan_id: loans.select(:id))
                          .includes(:loan)
                          .order(date: :desc)

    # Weighted average rate
    total_principal = loans.sum(:principal).to_f
    weighted_sum = loans.sum("principal * annual_rate").to_f
    avg_rate = total_principal > 0 ? (weighted_sum / total_principal).round(2) : 0.0

    # Tax document years: any year with payment activity
    tax_years = Payment.where(loan_id: loans.select(:id))
                       .select("DISTINCT EXTRACT(YEAR FROM date)::integer AS yr")
                       .map(&:yr)
                       .sort
                       .reverse

    # Check which years have 1098s (interest > $600)
    years_with_1098 = tax_years.select do |yr|
      year_interest = Payment.where(loan_id: loans.select(:id))
                             .where(date: Date.new(yr, 1, 1)..Date.new(yr, 12, 31))
                             .sum(:interest_portion).to_f
      year_interest > 600
    end

    respond_to do |format|
      format.json { render json: serialize_borrower_detail(@borrower) }
      format.any do
        render inertia: "Borrowers/Show", props: {
          borrower: serialize_borrower_detail(@borrower),
          loans: loans.map { |l| l.as_inertia_props(total_capital: total_capital) },
          payments: all_payments.map { |p| serialize_borrower_payment(p) },
          stats: {
            active_loans: loans.where(status: :active).count,
            total_principal: total_principal,
            interest_earned: all_payments.sum(:interest_portion).to_f,
            avg_rate: avg_rate
          },
          tax_documents: {
            years: tax_years,
            years_with_1098: years_with_1098,
            can_download: pro_or_above?,
            email_enabled: current_user.email_reminders_enabled,
            borrower_has_email: @borrower.email.present?
          }
        }
      end
    end
  end

  def new
    render inertia: "Borrowers/New"
  end

  def create
    borrower = current_user.borrowers.build(borrower_params)

    if borrower.save
      respond_to do |format|
        format.json { render json: { id: borrower.id, name: borrower.name }, status: :created }
        format.html { redirect_to borrower_path(borrower), notice: "Borrower created successfully." }
        format.any { redirect_to borrower_path(borrower), notice: "Borrower created successfully." }
      end
    else
      respond_to do |format|
        format.json { render json: { errors: borrower.errors.to_hash(true) }, status: :unprocessable_entity }
        format.html { redirect_to new_borrower_path, inertia: { errors: borrower.errors.to_hash(true) } }
        format.any { redirect_to new_borrower_path, inertia: { errors: borrower.errors.to_hash(true) } }
      end
    end
  end

  def edit
    render inertia: "Borrowers/Edit", props: {
      borrower: serialize_borrower_detail(@borrower)
    }
  end

  def update
    filtered = borrower_params
    # Don't overwrite existing TIN with blank (user left the masked field untouched)
    filtered = filtered.except(:tin) if filtered[:tin].blank? && @borrower.tin.present?

    if @borrower.update(filtered)
      # Keep borrower_name in sync on associated loans
      @borrower.loans.update_all(borrower_name: @borrower.name)
      redirect_to borrower_path(@borrower), notice: "Borrower updated successfully."
    else
      redirect_to edit_borrower_path(@borrower), inertia: { errors: @borrower.errors.to_hash(true) }
    end
  end

  def archive
    @borrower.archive!
    redirect_to borrowers_path, notice: "#{@borrower.name} archived."
  end

  def unarchive
    @borrower.unarchive!
    redirect_to borrower_path(@borrower), notice: "#{@borrower.name} restored."
  end

  def update_notes
    if @borrower.update(notes: params[:notes])
      render json: { notes: @borrower.notes }, status: :ok
    else
      render json: { error: "Could not update notes" }, status: :unprocessable_entity
    end
  end

  def reveal_tin
    render json: { tin: @borrower.tin }
  end

  def interest_statement
    year = params[:year].to_i
    pdf = Pdf::BorrowerInterestStatementPdf.new(borrower: @borrower, lender: current_user, year: year).generate

    Rails.logger.info("[Statement] Generated interest statement for borrower_id=#{@borrower.id} year=#{year} by user_id=#{current_user.id}")

    send_data pdf.render,
              filename: "statement_#{@borrower.name.parameterize}_#{year}.pdf",
              type: "application/pdf",
              disposition: "attachment"
  end

  def email_interest_statement
    year = params[:year].to_i

    unless current_user.email_reminders_enabled
      render json: { error: "Email notifications are disabled. Enable them in Settings to send statements." }, status: :unprocessable_entity
      return
    end

    unless @borrower.email.present?
      render json: { error: "This borrower has no email address on file." }, status: :unprocessable_entity
      return
    end

    if EmailLog.already_sent?(user: current_user, email_type: "borrower_interest_statement", reference_date: Date.new(year, 1, 1), payment_number: @borrower.id)
      render json: { error: "Statement for #{year} has already been emailed to this borrower." }, status: :unprocessable_entity
      return
    end

    LoanMailer.borrower_interest_statement(borrower: @borrower, lender: current_user, year: year).deliver_now

    EmailLog.record_send!(
      user: current_user,
      email_type: "borrower_interest_statement",
      recipient_email: @borrower.email,
      reference_date: Date.new(year, 1, 1),
      payment_number: @borrower.id
    )

    Rails.logger.info("[Statement] Emailed interest statement to borrower_id=#{@borrower.id} (#{@borrower.email}) year=#{year} by user_id=#{current_user.id}")

    render json: { message: "Statement sent to #{@borrower.email}" }
  end

  private

  def set_borrower
    @borrower = current_user.borrowers.find(params[:id])
  end

  def mask_tin(tin)
    return nil if tin.blank?
    "***-**-#{tin.last(4)}"
  end

  def borrower_params
    params.require(:borrower).permit(
      :name, :email, :phone,
      :address_line1, :address_line2, :city, :state, :zip,
      :notes, :tin
    )
  end

  def serialize_borrower_summary(borrower)
    loans = borrower.loans
    payments = Payment.where(loan_id: loans.select(:id))
    active_count = loans.where(status: :active).count
    last_payment = payments.maximum(:date)
    last_loan_start = loans.maximum(:start_date)
    last_activity = [last_payment, last_loan_start].compact.max&.to_s

    # Status: Active if has active loans, Paid Off if all paid off, Archived if archived
    status = if borrower.archived
               "archived"
             elsif active_count > 0
               "active"
             elsif loans.any?
               "paid_off"
             else
               "none"
             end

    {
      id: borrower.id,
      name: borrower.name,
      email: borrower.email,
      phone: borrower.phone,
      archived: borrower.archived,
      status: status,
      loan_count: loans.count,
      active_loan_count: active_count,
      total_principal: loans.sum(:principal).to_f,
      total_interest_received: payments.sum(:interest_portion).to_f,
      last_payment_date: last_payment&.to_s,
      last_activity: last_activity
    }
  end

  def serialize_borrower_payment(payment)
    loan = payment.loan
    {
      id: payment.id,
      date: payment.date.to_s,
      amount: payment.amount.to_f,
      principal_portion: payment.principal_portion.to_f,
      interest_portion: payment.interest_portion.to_f,
      late_fee: payment.late_fee.to_f,
      note: payment.note,
      loan_id: loan.id,
      loan_label: "$#{ActiveSupport::NumberHelper.number_to_delimited(loan.principal.to_i)} at #{loan.annual_rate}%"
    }
  end

  def serialize_borrower_detail(borrower)
    {
      id: borrower.id,
      name: borrower.name,
      email: borrower.email,
      phone: borrower.phone,
      address_line1: borrower.address_line1,
      address_line2: borrower.address_line2,
      city: borrower.city,
      state: borrower.state,
      zip: borrower.zip,
      notes: borrower.notes,
      tin: mask_tin(borrower.tin),
      archived: borrower.archived,
      created_at: borrower.created_at.iso8601
    }
  end
end
