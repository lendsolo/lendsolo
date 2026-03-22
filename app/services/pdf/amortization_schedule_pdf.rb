module Pdf
  class AmortizationSchedulePdf < BasePdf
    def initialize(loan, user)
      @loan = loan
      @user = user
    end

    def render
      pdf = setup_document
      render_header(pdf, "Amortization Schedule", subtitle: @loan.display_borrower_name, business_name: @user.business_name)

      render_loan_terms(pdf)
      pdf.move_down 16

      render_schedule_table(pdf)

      render_footer(pdf, note: "This schedule is for informational purposes only. Actual payments may vary")
      pdf
    end

    private

    def render_loan_terms(pdf)
      section_heading(pdf, "Loan Terms")

      monthly = @loan.monthly_payment
      total_interest = @loan.total_interest
      total_cost = @loan.total_cost

      info_box(pdf, [
        ["Borrower", @loan.display_borrower_name],
        ["Loan Type", @loan.loan_type.titleize],
        ["Principal", fmt(@loan.principal.to_f)],
        ["Annual Rate", "#{@loan.annual_rate}%"],
        ["Term", "#{@loan.term_months} months"],
        ["Start Date", @loan.start_date.strftime("%B %d, %Y")],
        ["Monthly Payment", fmt(monthly)],
        ["Total Interest", fmt(total_interest)],
        ["Total Cost", fmt(total_cost)],
        ["Payments Made", "#{@loan.payments_made_count} of #{@loan.term_months}"]
      ])
    end

    def render_schedule_table(pdf)
      section_heading(pdf, "Payment Schedule")

      schedule = Calculations::AmortizationCalculator.call(
        principal: @loan.principal,
        annual_rate: @loan.annual_rate,
        term_months: @loan.term_months,
        start_date: @loan.start_date,
        loan_type: @loan.loan_type.to_sym
      ).schedule

      payments_made = @loan.payments_made_count
      header = ["Month", "Due Date", "Payment", "Principal", "Interest", "Balance"]

      rows = schedule.map do |row|
        is_paid = row[:month] <= payments_made
        month_label = is_paid ? "#{row[:month]} *" : row[:month].to_s

        [
          month_label,
          row[:due_date].strftime("%m/%d/%Y"),
          fmt(row[:payment].to_f),
          fmt(row[:principal_portion].to_f),
          fmt(row[:interest_portion].to_f),
          fmt(row[:remaining_balance].to_f)
        ]
      end

      # Totals row
      total_payment = schedule.sum { |r| r[:payment].to_f }
      total_principal = schedule.sum { |r| r[:principal_portion].to_f }
      total_interest = schedule.sum { |r| r[:interest_portion].to_f }

      rows << [
        { content: "TOTALS", font_style: :bold },
        "",
        { content: fmt(total_payment), font_style: :bold },
        { content: fmt(total_principal), font_style: :bold },
        { content: fmt(total_interest), font_style: :bold },
        ""
      ]

      styled_table(pdf, header, rows, right_align_from: 2, highlight_last: true) do |t|
        t.columns(0).width = 50

        # Shade paid rows with light green
        payments_made.times do |i|
          t.row(i + 1).background_color = "F0FDF4" # very light green
        end

        # Re-apply header/footer styling after row coloring
        t.row(0).background_color = HEADER_BG
        t.row(-1).background_color = LIGHT_BG
      end
    end
  end
end
