class ReportsController < ApplicationController
  before_action :enforce_pro_gate!

  def loan_statement
    loan = current_user.loans.includes(:payments).find(params[:id])
    pdf = Pdf::LoanStatementPdf.new(loan, current_user).render

    send_data pdf.render,
              filename: "lendsolo_statement_#{loan.display_borrower_name.parameterize}_#{Time.current.strftime('%Y%m%d')}.pdf",
              type: "application/pdf",
              disposition: "attachment"
  end

  def amortization_schedule
    loan = current_user.loans.includes(:payments).find(params[:id])
    pdf = Pdf::AmortizationSchedulePdf.new(loan, current_user).render

    send_data pdf.render,
              filename: "lendsolo_amortization_#{loan.display_borrower_name.parameterize}_#{Time.current.strftime('%Y%m%d')}.pdf",
              type: "application/pdf",
              disposition: "attachment"
  end

  def year_end
    year = params[:year].to_i
    year = Date.current.year - 1 if year < 2000 || year > Date.current.year

    pdf = Pdf::YearEndSummaryPdf.new(current_user, year).render

    send_data pdf.render,
              filename: "lendsolo_year_end_#{year}_#{Time.current.strftime('%Y%m%d')}.pdf",
              type: "application/pdf",
              disposition: "attachment"
  end

  # Reports index page
  def index
    current_year = Date.current.year
    available_years = (current_year - 3..current_year).to_a.reverse

    loans = current_user.loans.order(:borrower_name).map do |loan|
      {
        id: loan.id,
        borrower_name: loan.display_borrower_name,
        status: loan.status,
        principal: loan.principal.to_f,
        start_date: loan.start_date.to_s
      }
    end

    render inertia: "Reports/Index", props: {
      loans: loans,
      available_years: available_years,
      can_generate: can_generate_reports?
    }
  end

  private

  def can_generate_reports?
    %w[pro fund].include?(current_user.effective_plan)
  end

  def enforce_pro_gate!
    return if action_name == "index" # Allow viewing the page (shows upgrade prompt)

    unless can_generate_reports?
      redirect_to reports_path, alert: "PDF reports require the Pro plan. Upgrade to download."
    end
  end
end
