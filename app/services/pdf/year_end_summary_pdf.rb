module Pdf
  class YearEndSummaryPdf < BasePdf
    def initialize(user, year)
      @user = user
      @year = year.to_i
    end

    def render
      pdf = setup_document
      render_header(pdf, "Year-End Lending Summary — #{@year}", business_name: @user.business_name)

      data = compute_data

      render_income_summary(pdf, data)
      pdf.move_down 20

      render_loan_details(pdf, data)
      pdf.move_down 20

      render_expense_summary(pdf, data)
      pdf.move_down 20

      render_net_income(pdf, data)
      pdf.move_down 16

      render_tax_note(pdf, data)

      render_footer(pdf, note: "For informational purposes only. Consult a qualified tax advisor for filing requirements")
      pdf
    end

    private

    def compute_data
      year_start = Date.new(@year, 1, 1)
      year_end = Date.new(@year, 12, 31)

      loans = @user.loans.includes(:payments)

      loan_summaries = loans.filter_map do |loan|
        year_payments = loan.payments.where(date: year_start..year_end)
        was_active = loan.start_date <= year_end && (loan.active? || loan.paid_off? || year_payments.any?)
        next unless was_active

        total_principal_paid_by_eoy = loan.payments.where("date <= ?", year_end).sum(:principal_portion).to_f
        remaining = [loan.principal.to_f - total_principal_paid_by_eoy, 0].max

        {
          borrower_name: loan.borrower_name,
          start_date: loan.start_date,
          principal: loan.principal.to_f,
          annual_rate: loan.annual_rate.to_f,
          term_months: loan.term_months,
          loan_type: loan.loan_type,
          status: loan.status,
          payments_received: year_payments.sum(:amount).to_f,
          principal_received: year_payments.sum(:principal_portion).to_f,
          interest_received: year_payments.sum(:interest_portion).to_f,
          remaining_balance: remaining,
          payment_count: year_payments.count
        }
      end

      expenses = @user.expenses.where(date: year_start..year_end).order(:date)
      total_expenses = expenses.sum(:amount).to_f
      expenses_by_category = @user.expenses.where(date: year_start..year_end)
                                  .group(:category).sum(:amount).transform_values(&:to_f)

      total_interest = loan_summaries.sum { |l| l[:interest_received] }
      total_principal = loan_summaries.sum { |l| l[:principal_received] }

      {
        loan_summaries: loan_summaries,
        total_interest: total_interest,
        total_principal: total_principal,
        total_expenses: total_expenses,
        net_income: total_interest - total_expenses,
        expenses_by_category: expenses_by_category
      }
    end

    def render_income_summary(pdf, data)
      section_heading(pdf, "Income Overview")

      # Quick summary box
      pdf.bounding_box([0, pdf.cursor], width: pdf.bounds.width) do
        pdf.stroke_color BORDER
        pdf.fill_color LIGHT_BG
        pdf.fill_and_stroke_rounded_rectangle [0, pdf.cursor], pdf.bounds.width, 68, 4
        pdf.fill_color "000000"
        pdf.stroke_color "000000"

        pdf.move_down 12
        pdf.indent(16) do
          col_w = (pdf.bounds.width - 32) / 4

          labels = ["Total Interest Income", "Principal Returned", "Total Expenses", "Net Lending Income"]
          values = [
            data[:total_interest],
            data[:total_principal],
            data[:total_expenses],
            data[:net_income]
          ]
          colors = [GREEN, DARK, "DC2626", data[:net_income] >= 0 ? GREEN : "DC2626"]

          labels.each_with_index do |label, i|
            x = i * col_w
            pdf.text_box label, at: [x, pdf.cursor], width: col_w, size: 7, color: MUTED
            pdf.text_box fmt(values[i]), at: [x, pdf.cursor - 10], width: col_w, size: 13, style: :bold, color: colors[i]
          end
        end
      end

      pdf.move_down 76
    end

    def render_loan_details(pdf, data)
      section_heading(pdf, "Interest Income by Loan")

      if data[:loan_summaries].empty?
        pdf.text "No loan activity recorded for #{@year}.", color: "999999", size: 10
        return
      end

      header = ["Borrower", "Start Date", "Principal", "Rate", "Interest\nEarned", "Principal\nReturned", "Balance\n12/31"]

      rows = data[:loan_summaries].map do |l|
        [
          l[:borrower_name],
          l[:start_date].strftime("%m/%d/%Y"),
          fmt(l[:principal]),
          "#{l[:annual_rate]}%",
          fmt(l[:interest_received]),
          fmt(l[:principal_received]),
          fmt(l[:remaining_balance])
        ]
      end

      # Totals
      rows << [
        { content: "TOTALS", font_style: :bold },
        "", "", "",
        { content: fmt(data[:total_interest]), font_style: :bold },
        { content: fmt(data[:total_principal]), font_style: :bold },
        ""
      ]

      styled_table(pdf, header, rows, right_align_from: 2, highlight_last: true)
    end

    def render_expense_summary(pdf, data)
      section_heading(pdf, "Expense Summary")

      if data[:expenses_by_category].empty?
        pdf.text "No expenses recorded for #{@year}.", color: "999999", size: 10
        return
      end

      expense_rows = data[:expenses_by_category].sort_by { |_, v| -v }.map do |cat, amt|
        [cat.titleize, fmt(amt)]
      end

      expense_rows << [
        { content: "TOTAL EXPENSES", font_style: :bold },
        { content: fmt(data[:total_expenses]), font_style: :bold }
      ]

      styled_table(pdf, ["Category", "Amount"], expense_rows,
        width: 300, right_align_from: 1, highlight_last: true)
    end

    def render_net_income(pdf, data)
      section_heading(pdf, "Net Income Summary")

      pdf.bounding_box([0, pdf.cursor], width: 340) do
        pdf.stroke_color BORDER
        pdf.fill_color LIGHT_BG
        pdf.fill_and_stroke_rounded_rectangle [0, pdf.cursor], 340, 90, 6
        pdf.fill_color "000000"
        pdf.stroke_color "000000"

        pdf.move_down 14
        pdf.indent(16) do
          pdf.font_size(9) do
            pdf.text "Total Interest Income:", color: MUTED
            pdf.text fmt(data[:total_interest]), color: GREEN, style: :bold, size: 14
            pdf.move_down 4
            pdf.text "Total Expenses:  (#{fmt(data[:total_expenses])})", color: MUTED
            pdf.move_down 4
            color = data[:net_income] >= 0 ? GREEN : "DC2626"
            pdf.text "Net Lending Income:  #{fmt(data[:net_income])}", style: :bold, color: color, size: 12
          end
        end
      end
    end

    def render_tax_note(pdf, data)
      return unless data[:total_interest] > 0

      pdf.move_down 16

      pdf.fill_color "FFFBEB"
      pdf.fill_rounded_rectangle [0, pdf.cursor], pdf.bounds.width, 44, 4
      pdf.fill_color "000000"

      pdf.move_down 8
      pdf.indent(12) do
        pdf.font_size(8) do
          pdf.text "Tax Filing Reminder", style: :bold, color: "92400E"
          pdf.move_down 2
          pdf.text "Interest income of #{fmt(data[:total_interest])} is generally reportable. " \
                   "Loans where you received more than $600 in interest may require Form 1098 filing. " \
                   "Consult a qualified tax professional for your specific filing requirements.",
                   color: "92400E"
        end
      end
    end
  end
end
