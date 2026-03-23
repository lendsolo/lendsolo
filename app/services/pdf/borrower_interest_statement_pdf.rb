module Pdf
  class BorrowerInterestStatementPdf < BasePdf
    def initialize(borrower:, lender:, year:)
      @borrower = borrower
      @lender = lender
      @year = year.to_i
    end

    def generate
      compute_data
      pdf = setup_document
      render_header(pdf, "Annual Interest Statement — #{@year}", business_name: @lender.business_name)

      render_lender_address(pdf)
      render_borrower_info(pdf)
      pdf.move_down 16

      render_loan_table(pdf)
      pdf.move_down 16

      render_summary(pdf)
      pdf.move_down 16

      render_1098_notice(pdf) if @total_interest > 600
      render_partial_year_note(pdf) if @year == Date.current.year
      render_disclaimer(pdf)

      render_footer(pdf, note: "This statement is provided for informational purposes. Consult your tax advisor for filing requirements")
      pdf
    end

    private

    def compute_data
      year_start = Date.new(@year, 1, 1)
      year_end = Date.new(@year, 12, 31)

      loans = @borrower.loans.where(user_id: @lender.id).includes(:payments)

      @loan_rows = loans.filter_map do |loan|
        year_payments = loan.payments.where(date: year_start..year_end)
        next if year_payments.empty?

        interest_paid = year_payments.sum(:interest_portion).to_f
        principal_paid = year_payments.sum(:principal_portion).to_f

        total_principal_paid_by_eoy = loan.payments.where("date <= ?", year_end).sum(:principal_portion).to_f
        balance = [loan.principal.to_f - total_principal_paid_by_eoy, 0].max

        {
          loan: loan,
          original_principal: loan.principal.to_f,
          rate: loan.annual_rate.to_f,
          interest_paid: interest_paid,
          principal_paid: principal_paid,
          balance: balance
        }
      end

      @total_interest = @loan_rows.sum { |r| r[:interest_paid] }
      @total_principal = @loan_rows.sum { |r| r[:principal_paid] }
      @total_balance = @loan_rows.sum { |r| r[:balance] }
    end

    def render_lender_address(pdf)
      pdf.font_size(9) do
        if @lender.lender_street_address.present?
          address_parts = [@lender.lender_street_address]
          city_state_zip = [@lender.lender_city, @lender.lender_state].select(&:present?).join(", ")
          city_state_zip += " #{@lender.lender_zip}" if @lender.lender_zip.present?
          address_parts << city_state_zip if city_state_zip.present?
          pdf.text address_parts.join(" · "), color: MUTED
          pdf.move_down 4
        end
      end
    end

    def render_borrower_info(pdf)
      pdf.move_down 12

      pdf.font_size(9) { pdf.text "Prepared for:", color: MUTED }
      pdf.move_down 2
      pdf.font_size(13) { pdf.text @borrower.name, style: :bold, color: DARK }

      if @borrower.address_line1.present?
        pdf.move_down 4
        pdf.font_size(9) do
          pdf.text @borrower.address_line1, color: DARK
          pdf.text @borrower.address_line2, color: DARK if @borrower.address_line2.present?
          city_state_zip = [@borrower.city, @borrower.state].select(&:present?).join(", ")
          city_state_zip += " #{@borrower.zip}" if @borrower.zip.present?
          pdf.text city_state_zip, color: DARK if city_state_zip.present?
        end
      end
    end

    def render_loan_table(pdf)
      section_heading(pdf, "Loan Activity — #{@year}")

      if @loan_rows.empty?
        pdf.text "No payment activity recorded for #{@year}.", color: MUTED, size: 10
        return
      end

      header = ["Loan", "Original\nPrincipal", "Rate", "Interest\nPaid", "Principal\nPaid", "Balance\n12/31"]

      rows = @loan_rows.map do |r|
        loan = r[:loan]
        label = "#{loan.loan_type.titleize} — #{loan.start_date.strftime('%m/%Y')}"
        [
          label,
          fmt(r[:original_principal]),
          "#{r[:rate]}%",
          fmt(r[:interest_paid]),
          fmt(r[:principal_paid]),
          fmt(r[:balance])
        ]
      end

      # Totals row
      rows << [
        { content: "TOTALS", font_style: :bold },
        "", "",
        { content: fmt(@total_interest), font_style: :bold },
        { content: fmt(@total_principal), font_style: :bold },
        { content: fmt(@total_balance), font_style: :bold }
      ]

      styled_table(pdf, header, rows, right_align_from: 1, highlight_last: true)
    end

    def render_summary(pdf)
      section_heading(pdf, "Annual Summary")

      info_box(pdf, [
        "Total Interest Paid", fmt(@total_interest),
        "Total Principal Paid", fmt(@total_principal),
        "Total Remaining Balance", fmt(@total_balance),
        "Loans with Activity", @loan_rows.length.to_s
      ])
    end

    def render_1098_notice(pdf)
      pdf.fill_color "FFFBEB"
      pdf.fill_rounded_rectangle [0, pdf.cursor], pdf.bounds.width, 44, 4
      pdf.fill_color "000000"

      pdf.move_down 8
      pdf.indent(12) do
        pdf.font_size(8) do
          pdf.text "1098 Filing Notice", style: :bold, color: "92400E"
          pdf.move_down 2
          pdf.text "Total interest paid exceeds $600. A Form 1098 has been or will be filed with the IRS for tax year #{@year}.",
                   color: "92400E"
        end
      end

      pdf.move_down 28
    end

    def render_partial_year_note(pdf)
      pdf.fill_color "EFF6FF"
      pdf.fill_rounded_rectangle [0, pdf.cursor], pdf.bounds.width, 36, 4
      pdf.fill_color "000000"

      pdf.move_down 8
      pdf.indent(12) do
        pdf.font_size(8) do
          pdf.text "This statement covers activity through #{Date.current.strftime('%B %d, %Y')}. Final statement available after year-end.",
                   color: "1E40AF"
        end
      end

      pdf.move_down 20
    end

    def render_disclaimer(pdf)
      pdf.font_size(7) do
        pdf.text "This statement is provided for informational purposes only. Please consult your tax advisor regarding filing requirements.",
                 color: MUTED
      end
    end
  end
end
