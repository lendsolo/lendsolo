class ImportsController < ApplicationController
  before_action :enforce_solo_gate!, only: %i[create process_import]

  def new
    render inertia: "Imports/New", props: {
      can_import: solo_or_above?
    }
  end

  def create
    file = params[:file]

    unless file.present?
      redirect_to new_import_path, alert: "Please select a file to upload."
      return
    end

    ext = File.extname(file.original_filename).downcase
    unless %w[.csv .xlsx .xls].include?(ext)
      redirect_to new_import_path, alert: "Unsupported file format. Please upload a .csv or .xlsx file."
      return
    end

    begin
      spreadsheet = open_spreadsheet(file)
      headers = spreadsheet.row(1).map { |h| h.to_s.strip }
      rows = []

      (2..spreadsheet.last_row).each do |i|
        row = spreadsheet.row(i).map { |cell| cell.to_s.strip }
        # Skip completely blank rows
        next if row.all?(&:blank?)
        rows << row
      end

      if rows.empty?
        redirect_to new_import_path, alert: "The file appears to be empty."
        return
      end

      # Auto-detect column mappings
      auto_mappings = detect_mappings(headers)

      render inertia: "Imports/New", props: {
        parsed_data: {
          headers: headers,
          rows: rows,
          total_rows: rows.length,
          filename: file.original_filename
        },
        auto_mappings: auto_mappings
      }
    rescue => e
      Rails.logger.error("Import parse error: #{e.message}")
      redirect_to new_import_path, alert: "Could not parse the file. Please check the format and try again."
    end
  end

  def process_import
    loans_data = params.require(:loans).map { |l| l.permit(:borrower_name, :principal, :annual_rate, :term_months, :loan_type, :start_date, :status, :purpose, :collateral, :notes) }

    created = 0
    skipped = 0
    errors_list = []

    ActiveRecord::Base.transaction do
      loans_data.each_with_index do |loan_data, index|
        borrower_name = loan_data[:borrower_name].presence&.strip || "Unknown Borrower"
        borrower = current_user.borrowers.find_or_create_by!(name: borrower_name)

        loan = current_user.loans.build(
          borrower: borrower,
          borrower_name: borrower_name,
          principal: parse_currency(loan_data[:principal]),
          annual_rate: parse_number(loan_data[:annual_rate]),
          term_months: parse_number(loan_data[:term_months])&.to_i,
          start_date: parse_date(loan_data[:start_date]),
          loan_type: parse_loan_type(loan_data[:loan_type]),
          purpose: loan_data[:purpose].presence,
          collateral_description: loan_data[:collateral].presence,
          notes: loan_data[:notes].presence,
          status: parse_status(loan_data[:status])
        )

        if loan.save
          created += 1
        else
          skipped += 1
          errors_list << { row: index + 1, errors: loan.errors.full_messages }
        end
      end
    end

    render inertia: "Imports/New", props: {
      import_result: {
        created: created,
        skipped: skipped,
        errors: errors_list
      }
    }
  end

  private

  def open_spreadsheet(file)
    case File.extname(file.original_filename).downcase
    when ".csv"
      Roo::CSV.new(file.path)
    when ".xlsx"
      Roo::Excelx.new(file.path)
    when ".xls"
      Roo::Excel.new(file.path)
    else
      raise "Unsupported file format"
    end
  end

  def detect_mappings(headers)
    mappings = {}
    field_patterns = {
      "borrower_name" => /\b(borrower|name|client|debtor|customer|who)\b/i,
      "principal" => /\b(principal|amount|loan.?amount|balance|funded|size)\b/i,
      "annual_rate" => /\b(rate|interest|apr|annual|%)\b/i,
      "term_months" => /\b(term|month|duration|length|period)\b/i,
      "start_date" => /\b(start|date|origin|begin|funded.?date|issue)\b/i,
      "loan_type" => /\b(type|kind|product|loan.?type)\b/i,
      "purpose" => /\b(purpose|reason|use|description)\b/i,
      "collateral" => /\b(collateral|security|asset|guarantee)\b/i,
      "status" => /\b(status|state|active|condition)\b/i,
      "notes" => /\b(note|comment|memo|remark)\b/i
    }

    headers.each_with_index do |header, index|
      field_patterns.each do |field, pattern|
        if header.match?(pattern) && !mappings.values.include?(index)
          mappings[field] = index
          break
        end
      end
    end

    mappings
  end

  def parse_currency(value)
    return nil if value.blank?
    value.to_s.gsub(/[$,\s]/, "").to_f
  end

  def parse_number(value)
    return nil if value.blank?
    value.to_s.gsub(/[%,\s]/, "").to_f
  end

  def parse_date(value)
    return Date.current if value.blank?

    begin
      Date.parse(value.to_s)
    rescue ArgumentError
      # Try common US format MM/DD/YYYY
      begin
        Date.strptime(value.to_s, "%m/%d/%Y")
      rescue ArgumentError
        Date.current
      end
    end
  end

  def parse_loan_type(value)
    return "standard" if value.blank?

    normalized = value.to_s.downcase.strip
    case normalized
    when /interest.?only/
      "interest_only"
    when /balloon/
      "balloon"
    else
      "standard"
    end
  end

  def parse_status(value)
    return "active" if value.blank?

    normalized = value.to_s.downcase.strip
    case normalized
    when /paid|completed|closed/
      "paid_off"
    when /default/
      "defaulted"
    when /written|write/
      "written_off"
    else
      "active"
    end
  end
end
