class BorrowersController < ApplicationController
  before_action :set_borrower, only: %i[show edit update archive unarchive]

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

    respond_to do |format|
      format.json { render json: serialize_borrower_detail(@borrower) }
      format.any do
        render inertia: "Borrowers/Show", props: {
          borrower: serialize_borrower_detail(@borrower),
          loans: loans.map { |l| l.as_inertia_props(total_capital: total_capital) }
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

    {
      id: borrower.id,
      name: borrower.name,
      email: borrower.email,
      phone: borrower.phone,
      archived: borrower.archived,
      loan_count: loans.count,
      total_principal: loans.sum(:principal).to_f,
      total_interest_received: payments.sum(:interest_portion).to_f,
      last_payment_date: payments.maximum(:date)&.to_s
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
