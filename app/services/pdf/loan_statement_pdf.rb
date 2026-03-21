module Pdf
  class LoanStatementPdf < BasePdf
    def initialize(loan, user)
      @loan = loan
      @user = user
    end

    def render
      pdf = setup_document
      render_header(pdf, "Loan Statement", subtitle: "Generated #{Date.current.strftime('%B %d, %Y')}", business_name: @user.business_name)

      render_loan_summary(pdf)
      pdf.move_down 20

      render_payment_history(pdf)
      pdf.move_down 20

      render_account_summary(pdf)

      render_footer(pdf, note: "This statement is for informational purposes only and does not constitute a legal document")
      pdf
    end

    private

    def render_loan_summary(pdf)
      section_heading(pdf, "Loan Summary")

      info_box(pdf, [
        ["Borrower", @loan.borrower_name],
        ["Loan Type", @loan.loan_type.titleize],
        ["Original Principal", fmt(@loan.principal.to_f)],
        ["Annual Interest Rate", "#{@loan.annual_rate}%"],
        ["Term", "#{@loan.term_months} months"],
        ["Start Date", @loan.start_date.strftime("%B %d, %Y")],
        ["Current Balance", fmt(@loan.remaining_balance)],
        ["Status", @loan.status.titleize]
      ])
    end

    def render_payment_history(pdf)
      section_heading(pdf, "Payment History")

      payments = @loan.payments.order(:date)

      if payments.empty?
        pdf.text "No payments have been recorded for this loan.", color: "999999", size: 10
        return
      end

      # Build running balance
      balance = @loan.principal.to_f
      header = ["#", "Date", "Amount", "Principal", "Interest", "Late Fee", "Balance"]

      rows = payments.each_with_index.map do |payment, idx|
        balance -= payment.principal_portion.to_f
        balance = [balance, 0].max

        [
          (idx + 1).to_s,
          payment.date.strftime("%m/%d/%Y"),
          fmt(payment.amount.to_f),
          fmt(payment.principal_portion.to_f),
          fmt(payment.interest_portion.to_f),
          payment.late_fee.to_f > 0 ? fmt(payment.late_fee.to_f) : "—",
          fmt(balance)
        ]
      end

      # Totals row
      total_amount = payments.sum(:amount).to_f
      total_principal = payments.sum(:principal_portion).to_f
      total_interest = payments.sum(:interest_portion).to_f
      total_late = payments.sum(:late_fee).to_f

      rows << [
        { content: "TOTALS", font_style: :bold },
        "",
        { content: fmt(total_amount), font_style: :bold },
        { content: fmt(total_principal), font_style: :bold },
        { content: fmt(total_interest), font_style: :bold },
        total_late > 0 ? { content: fmt(total_late), font_style: :bold } : "",
        ""
      ]

      styled_table(pdf, header, rows, right_align_from: 2, highlight_last: true) do |t|
        t.columns(0).width = 30
      end
    end

    def render_account_summary(pdf)
      section_heading(pdf, "Account Summary")

      total_paid = @loan.total_paid
      principal_returned = @loan.principal_returned
      interest_earned = @loan.interest_earned
      remaining = @loan.remaining_balance
      repayment_pct = @loan.repayment_percentage

      # Summary box
      pdf.bounding_box([0, pdf.cursor], width: 320) do
        pdf.stroke_color BORDER
        pdf.fill_color LIGHT_BG
        pdf.fill_and_stroke_rounded_rectangle [0, pdf.cursor], 320, 100, 6
        pdf.fill_color "000000"
        pdf.stroke_color "000000"

        pdf.move_down 14
        pdf.indent(16) do
          pdf.font_size(9) do
            pdf.text "Total Payments Received:", color: MUTED
            pdf.text fmt(total_paid), color: GREEN, style: :bold, size: 14
            pdf.move_down 4
            pdf.text "Principal Returned: #{fmt(principal_returned)}    Interest Earned: #{fmt(interest_earned)}", color: MUTED
            pdf.move_down 4
            pdf.text "Remaining Balance: #{fmt(remaining)}    Repayment: #{repayment_pct}%", style: :bold, color: DARK, size: 10
          end
        end
      end
    end
  end
end
