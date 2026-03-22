class ExportsController < ApplicationController
  before_action :set_year
  before_action :enforce_pro_gate!, except: :index

  def index
    year_data = compute_year_data

    render inertia: "Exports/Index", props: {
      year: @year,
      available_years: available_years,
      preview: {
        total_interest: year_data[:total_interest],
        total_principal: year_data[:total_principal],
        total_expenses: year_data[:total_expenses],
        net_income: year_data[:net_income],
        loans_count: year_data[:loan_summaries].length,
        payments_count: year_data[:payments_count],
        has_data: year_data[:payments_count] > 0 || year_data[:expenses].any?
      },
      can_export: can_export?
    }
  end

  def year_end_summary_pdf
    data = compute_year_data

    pdf = generate_pdf(data)
    send_data pdf.render,
              filename: "lendsolo_year_end_#{@year}_#{Time.current.strftime('%Y%m%d%H%M%S')}.pdf",
              type: "application/pdf",
              disposition: "attachment"
  end

  def year_end_summary_csv
    data = compute_year_data
    csv = generate_year_end_csv(data)

    send_data csv,
              filename: "lendsolo_year_end_#{@year}_#{Time.current.strftime('%Y%m%d%H%M%S')}.csv",
              type: "text/csv",
              disposition: "attachment"
  end

  def quickbooks_qbo
    data = compute_year_data
    qbo = generate_qbo(data)

    send_data qbo,
              filename: "lendsolo_#{@year}_interest_income.qbo",
              type: "application/x-ofx",
              disposition: "attachment"
  end

  def expenses_csv
    expenses = current_user.expenses
      .where(date: Date.new(@year, 1, 1)..Date.new(@year, 12, 31))
      .order(:date)

    csv = generate_expenses_csv(expenses)

    send_data csv,
              filename: "lendsolo_expenses_#{@year}_#{Time.current.strftime('%Y%m%d%H%M%S')}.csv",
              type: "text/csv",
              disposition: "attachment"
  end

  private

  def set_year
    @year = (params[:year] || Date.current.year - 1).to_i
  end

  def can_export?
    pro_or_above?
  end

  def available_years
    current_year = Date.current.year
    (current_year - 3..current_year).to_a.reverse
  end

  def compute_year_data
    year_start = Date.new(@year, 1, 1)
    year_end = Date.new(@year, 12, 31)

    # Loans active during the year (had payments or were active)
    loans = current_user.loans.includes(:payments)

    loan_summaries = loans.filter_map do |loan|
      year_payments = loan.payments.where(date: year_start..year_end)
      # Include if loan had payments this year OR was active during this year
      was_active = loan.start_date <= year_end && (loan.active? || loan.paid_off? || year_payments.any?)
      next unless was_active

      # Remaining balance as of Dec 31: principal minus all principal payments up to year end
      total_principal_paid_by_eoy = loan.payments.where("date <= ?", year_end).sum(:principal_portion).to_f
      remaining = [loan.principal.to_f - total_principal_paid_by_eoy, 0].max

      {
        borrower_name: loan.borrower_name,
        start_date: loan.start_date.to_s,
        principal: loan.principal.to_f,
        annual_rate: loan.annual_rate.to_f,
        term_months: loan.term_months,
        loan_type: loan.loan_type,
        status: loan.status,
        payments_received: year_payments.sum(:amount).to_f,
        principal_received: year_payments.sum(:principal_portion).to_f,
        interest_received: year_payments.sum(:interest_portion).to_f,
        remaining_balance: remaining
      }
    end

    expenses = current_user.expenses.where(date: year_start..year_end).order(:date)
    total_expenses = expenses.sum(:amount).to_f

    expenses_by_category = current_user.expenses.where(date: year_start..year_end)
                                       .group(:category).sum(:amount).transform_values(&:to_f)

    total_interest = loan_summaries.sum { |l| l[:interest_received] }
    total_principal = loan_summaries.sum { |l| l[:principal_received] }
    payments_count = Payment.joins(:loan).where(loans: { user_id: current_user.id })
                            .where(date: year_start..year_end).count

    # Individual payment records for QBO
    payment_records = Payment.joins(:loan)
      .where(loans: { user_id: current_user.id })
      .where(date: year_start..year_end)
      .where("interest_portion > 0")
      .includes(:loan)
      .order(:date)

    {
      loan_summaries: loan_summaries,
      total_interest: total_interest,
      total_principal: total_principal,
      total_expenses: total_expenses,
      net_income: total_interest - total_expenses,
      expenses: expenses,
      expenses_by_category: expenses_by_category,
      payments_count: payments_count,
      payment_records: payment_records
    }
  end

  # ── PDF Generation ────────────────────────────────────────────────────────

  def generate_pdf(data)
    business_name = current_user.business_name.presence || "My Lending Business"
    green = "1A7A50"

    pdf = Prawn::Document.new(page_size: "LETTER", margin: [50, 50, 60, 50])

    # ── Header ──
    pdf.font_size(18) { pdf.text business_name, style: :bold, color: "1C1C19" }
    pdf.move_down 4
    pdf.font_size(12) { pdf.text "Year-End Lending Summary — #{@year}", color: "666666" }
    pdf.move_down 6
    pdf.stroke_color green
    pdf.line_width 2
    pdf.stroke_horizontal_rule
    pdf.stroke_color "000000"
    pdf.line_width 1
    pdf.move_down 20

    # ── Section 1: Interest Income ──
    pdf.font_size(13) { pdf.text "Interest Income Summary", style: :bold, color: green }
    pdf.move_down 10

    if data[:loan_summaries].any?
      header = ["Borrower", "Start Date", "Principal", "Rate", "Payments\nReceived", "Principal\nReceived", "Interest\nReceived", "Balance\n12/31"]
      rows = data[:loan_summaries].map do |l|
        [
          l[:borrower_name],
          l[:start_date],
          fmt(l[:principal]),
          "#{l[:annual_rate]}%",
          fmt(l[:payments_received]),
          fmt(l[:principal_received]),
          fmt(l[:interest_received]),
          fmt(l[:remaining_balance])
        ]
      end

      # Totals row
      rows << [
        { content: "TOTALS", font_style: :bold }, "", "", "",
        { content: fmt(data[:loan_summaries].sum { |l| l[:payments_received] }), font_style: :bold },
        { content: fmt(data[:total_principal]), font_style: :bold },
        { content: fmt(data[:total_interest]), font_style: :bold },
        ""
      ]

      pdf.table([header] + rows, width: pdf.bounds.width, cell_style: { size: 8, padding: [4, 6] }) do |t|
        t.row(0).font_style = :bold
        t.row(0).background_color = "F0F7F4"
        t.row(0).text_color = green
        t.row(-1).background_color = "F9FAFB"
        t.columns(2..7).align = :right
        t.cells.border_width = 0.5
        t.cells.border_color = "E5E7EB"
      end
    else
      pdf.text "No loan activity recorded for #{@year}.", color: "999999", size: 10
    end

    pdf.move_down 20

    # ── Section 2: Expense Summary ──
    pdf.font_size(13) { pdf.text "Expense Summary", style: :bold, color: green }
    pdf.move_down 10

    if data[:expenses_by_category].any?
      expense_rows = data[:expenses_by_category].sort_by { |_, v| -v }.map do |cat, amt|
        [cat.titleize, fmt(amt)]
      end
      expense_rows << [{ content: "TOTAL EXPENSES", font_style: :bold }, { content: fmt(data[:total_expenses]), font_style: :bold }]

      pdf.table([["Category", "Amount"]] + expense_rows, width: 300, cell_style: { size: 9, padding: [4, 8] }) do |t|
        t.row(0).font_style = :bold
        t.row(0).background_color = "F0F7F4"
        t.row(0).text_color = green
        t.row(-1).background_color = "F9FAFB"
        t.columns(1).align = :right
        t.cells.border_width = 0.5
        t.cells.border_color = "E5E7EB"
      end
    else
      pdf.text "No expenses recorded for #{@year}.", color: "999999", size: 10
    end

    pdf.move_down 25

    # ── Section 3: Net Income Box ──
    pdf.bounding_box([0, pdf.cursor], width: 300) do
      pdf.stroke_color "E5E7EB"
      pdf.fill_color "F9FAFB"
      pdf.fill_and_stroke_rounded_rectangle [0, pdf.cursor], 300, 80, 6
      pdf.fill_color "000000"
      pdf.stroke_color "000000"

      pdf.move_down 12
      pdf.indent(16) do
        pdf.font_size(9) do
          pdf.text "Total Interest Income:", style: :bold, color: "374151"
          pdf.text fmt(data[:total_interest]), color: "059669", style: :bold, size: 14
          pdf.move_down 4
          pdf.text "Total Expenses:  (#{fmt(data[:total_expenses])})", color: "374151"
          pdf.move_down 2
          pdf.text "Net Lending Income:  #{fmt(data[:net_income])}", style: :bold, color: "1C1C19", size: 11
        end
      end
    end

    pdf.move_down 20

    # ── 1098 Note ──
    if data[:total_interest] > 0
      threshold_loans = data[:loan_summaries].select { |l| l[:interest_received] > 600 }
      if threshold_loans.any?
        pdf.fill_color "FFFBEB"
        pdf.fill_rounded_rectangle [0, pdf.cursor], pdf.bounds.width, 36, 4
        pdf.fill_color "000000"
        pdf.move_down 10
        pdf.indent(10) do
          pdf.font_size(8) do
            pdf.text "Note: Interest income of #{fmt(data[:total_interest])} may require 1098 filing for loans over $600. Consult your tax advisor.", color: "92400E"
          end
        end
        pdf.move_down 16
      end
    end

    # ── Footer ──
    pdf.repeat(:all) do
      pdf.bounding_box([0, 30], width: pdf.bounds.width, height: 20) do
        pdf.font_size(7) do
          pdf.text "Generated by LendSolo · #{Date.current.strftime('%B %d, %Y')} · For informational purposes only. Consult a qualified tax advisor.", color: "9CA3AF", align: :left
          pdf.text_box "Page #{pdf.page_number}", at: [pdf.bounds.width - 60, pdf.bounds.top], width: 60, align: :right, size: 7, color: "9CA3AF"
        end
      end
    end

    pdf
  end

  # ── CSV Generation ────────────────────────────────────────────────────────

  def generate_year_end_csv(data)
    require "csv"
    CSV.generate do |csv|
      csv << %w[borrower_name loan_start_date original_principal interest_rate term_months loan_type payments_received principal_received interest_received remaining_balance loan_status]

      data[:loan_summaries].each do |l|
        csv << [
          l[:borrower_name], l[:start_date], l[:principal], l[:annual_rate],
          l[:term_months], l[:loan_type], l[:payments_received],
          l[:principal_received], l[:interest_received], l[:remaining_balance], l[:status]
        ]
      end

      # Totals row
      csv << [
        "TOTALS", "", "", "", "", "",
        data[:loan_summaries].sum { |l| l[:payments_received] }.round(2),
        data[:total_principal].round(2),
        data[:total_interest].round(2),
        "", ""
      ]
    end
  end

  def generate_expenses_csv(expenses)
    require "csv"
    CSV.generate do |csv|
      csv << %w[date description category amount]

      expenses.each do |e|
        csv << [e.date.to_s, e.description, e.category, e.amount.to_f]
      end

      csv << ["", "", "TOTAL", expenses.sum(:amount).to_f.round(2)]
    end
  end

  # ── QBO Generation ────────────────────────────────────────────────────────

  def generate_qbo(data)
    now = Time.current
    dtstart = Date.new(@year, 1, 1).strftime("%Y%m%d")
    dtend = Date.new(@year, 12, 31).strftime("%Y%m%d")

    transactions = data[:payment_records].each_with_index.map do |payment, idx|
      payment_num = payment.loan.payments.where("date <= ?", payment.date).count
      fitid = "LS#{@year}#{(idx + 1).to_s.rjust(6, '0')}"

      <<~XML
        <STMTTRN>
          <TRNTYPE>CREDIT</TRNTYPE>
          <DTPOSTED>#{payment.date.strftime('%Y%m%d')}120000</DTPOSTED>
          <TRNAMT>#{payment.interest_portion.to_f.round(2)}</TRNAMT>
          <FITID>#{fitid}</FITID>
          <NAME>#{escape_xml(payment.loan.borrower_name)}</NAME>
          <MEMO>Loan interest - #{escape_xml(payment.loan.borrower_name)} - Payment ##{payment_num}</MEMO>
        </STMTTRN>
      XML
    end.join

    <<~QBO
      <!-- Generated by LendSolo. Import into QuickBooks via File > Import > Bank Transactions. Map to your interest income account. -->
      OFXHEADER:100
      DATA:OFXSGML
      VERSION:102
      SECURITY:NONE
      ENCODING:USASCII
      CHARSET:1252
      COMPRESSION:NONE
      OLDFILEUID:NONE
      NEWFILEUID:NONE

      <OFX>
        <SIGNONMSGSRSV1>
          <SONRS>
            <STATUS>
              <CODE>0</CODE>
              <SEVERITY>INFO</SEVERITY>
            </STATUS>
            <DTSERVER>#{now.strftime('%Y%m%d%H%M%S')}</DTSERVER>
            <LANGUAGE>ENG</LANGUAGE>
          </SONRS>
        </SIGNONMSGSRSV1>
        <BANKMSGSRSV1>
          <STMTTRNRS>
            <TRNUID>0</TRNUID>
            <STATUS>
              <CODE>0</CODE>
              <SEVERITY>INFO</SEVERITY>
            </STATUS>
            <STMTRS>
              <CURDEF>USD</CURDEF>
              <BANKACCTFROM>
                <BANKID>999999999</BANKID>
                <ACCTID>LENDSOLO_INTEREST</ACCTID>
                <ACCTTYPE>CHECKING</ACCTTYPE>
              </BANKACCTFROM>
              <BANKTRANLIST>
                <DTSTART>#{dtstart}120000</DTSTART>
                <DTEND>#{dtend}120000</DTEND>
      #{transactions}
              </BANKTRANLIST>
              <LEDGERBAL>
                <BALAMT>#{data[:total_interest].round(2)}</BALAMT>
                <DTASOF>#{dtend}120000</DTASOF>
              </LEDGERBAL>
            </STMTRS>
          </STMTTRNRS>
        </BANKMSGSRSV1>
      </OFX>
    QBO
  end

  def escape_xml(str)
    str.to_s.gsub("&", "&amp;").gsub("<", "&lt;").gsub(">", "&gt;")
  end

  def fmt(num)
    "$#{num.round(2).to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse}"
  end
end
