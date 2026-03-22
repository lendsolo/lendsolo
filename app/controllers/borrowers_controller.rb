class BorrowersController < ApplicationController
  before_action :set_borrower, only: %i[show edit update archive unarchive update_notes]

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
    if @borrower.update(borrower_params)
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

  private

  def set_borrower
    @borrower = current_user.borrowers.find(params[:id])
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
      tin: borrower.tin,
      archived: borrower.archived,
      created_at: borrower.created_at.iso8601
    }
  end
end
