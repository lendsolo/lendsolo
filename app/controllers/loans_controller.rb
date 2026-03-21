class LoansController < ApplicationController
  before_action :set_loan, only: %i[show edit update destroy mark_paid_off mark_defaulted]

  def index
    loans = current_user.loans.includes(:payments).order(created_at: :desc)

    render inertia: "Loans/Index", props: {
      loans: loans.map { |l| l.as_inertia_props(total_capital: current_user.total_capital) }
    }
  end

  def show
    render inertia: "Loans/Show", props: {
      loan: @loan.as_inertia_props(total_capital: current_user.total_capital),
      total_capital: current_user.total_capital.to_f
    }
  end

  def new
    render inertia: "Loans/New"
  end

  def create
    loan = current_user.loans.build(loan_params)

    if loan.save
      redirect_to loan_path(loan), notice: "Loan created successfully."
    else
      redirect_to new_loan_path, inertia: { errors: loan.errors.to_hash(true) }
    end
  end

  def edit
    render inertia: "Loans/Edit", props: {
      loan: @loan.as_inertia_props(total_capital: current_user.total_capital)
    }
  end

  def update
    if @loan.update(loan_params)
      redirect_to loan_path(@loan), notice: "Loan updated successfully."
    else
      redirect_to edit_loan_path(@loan), inertia: { errors: @loan.errors.to_hash(true) }
    end
  end

  def destroy
    @loan.destroy
    redirect_to loans_path, notice: "Loan deleted."
  end

  def mark_paid_off
    @loan.update!(status: :paid_off)
    redirect_to loan_path(@loan), notice: "Loan marked as paid off."
  end

  def mark_defaulted
    @loan.update!(status: :defaulted)
    redirect_to loan_path(@loan), notice: "Loan marked as defaulted."
  end

  private

  def set_loan
    @loan = current_user.loans.find(params[:id])
  end

  def loan_params
    params.require(:loan).permit(
      :borrower_name, :principal, :annual_rate, :term_months,
      :loan_type, :start_date, :purpose, :collateral_description, :notes
    )
  end
end
