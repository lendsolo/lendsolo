class LoansController < ApplicationController
  before_action :set_loan, only: %i[show edit update destroy mark_paid_off mark_defaulted]
  before_action :enforce_loan_limit!, only: %i[create]

  def index
    loans = current_user.loans.order(created_at: :desc)
    preloaded = Loan.preload_payment_stats(loans)

    render inertia: "Loans/Index", props: {
      loans: loans.map { |l| l.as_inertia_props(total_capital: current_user.total_capital, preloaded: preloaded) }
    }
  end

  def show
    guardrails = GuardrailService.new(@loan).check_all.map do |alert|
      { type: alert.type.to_s, severity: alert.severity.to_s, message: alert.message, detail: alert.detail }
    end

    render inertia: "Loans/Show", props: {
      loan: @loan.as_inertia_props(total_capital: current_user.total_capital),
      total_capital: current_user.total_capital.to_f,
      can_generate_reports: %w[pro fund].include?(current_user.effective_plan),
      guardrails: guardrails
    }
  end

  def new
    render inertia: "Loans/New", props: {
      borrowers: current_user.borrowers.active.order(:name).map { |b| { id: b.id, name: b.name } },
      pricing_ranges: pricing_ranges_by_type
    }
  end

  def create
    loan = current_user.loans.build(loan_params)
    resolve_borrower(loan)

    if loan.save
      # Start 14-day trial on first real loan (not sample data)
      if current_user.trial_ends_at.nil? && !current_user.active_subscription? && !loan.notes&.start_with?("Sample data")
        current_user.start_trial!
      end
      redirect_to loan_path(loan), notice: "Loan created successfully."
    else
      redirect_to new_loan_path, inertia: { errors: loan.errors.to_hash(true) }
    end
  end

  def edit
    render inertia: "Loans/Edit", props: {
      loan: @loan.as_inertia_props(total_capital: current_user.total_capital),
      borrowers: current_user.borrowers.active.order(:name).map { |b| { id: b.id, name: b.name } },
      pricing_ranges: pricing_ranges_by_type
    }
  end

  def update
    resolve_borrower(@loan)
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
      :borrower_id, :borrower_name, :principal, :annual_rate, :term_months,
      :loan_type, :start_date, :purpose, :collateral_description, :notes
    )
  end

  def pricing_ranges_by_type
    %w[standard interest_only balloon].each_with_object({}) do |loan_type, hash|
      property_type = loan_type == "interest_only" ? :commercial : :single_family
      result = Calculations::LoanPricingCalculator.call(
        ltv: 70, term_months: 12, property_type: property_type, borrower_experience: :experienced
      )
      hash[loan_type] = { min: result.suggested_rate_min.to_f, max: result.suggested_rate_max.to_f }
    end
  end

  def resolve_borrower(loan, attrs = nil)
    attrs ||= loan_params
    borrower_id = attrs[:borrower_id]
    borrower_name = attrs[:borrower_name]

    if borrower_id.present?
      borrower = current_user.borrowers.find(borrower_id)
      loan.borrower = borrower
      loan.borrower_name = borrower.name
    elsif borrower_name.present?
      borrower = current_user.borrowers.find_or_create_by!(name: borrower_name.strip)
      loan.borrower = borrower
      loan.borrower_name = borrower_name.strip
    end
  end
end
