class GuardrailService
  Alert = Struct.new(:type, :severity, :message, :detail, keyword_init: true)

  def initialize(loan)
    @loan = loan
    @user = loan.user
  end

  def check_all
    alerts = []
    alerts.concat(check_concentration)
    alerts.concat(check_collateral)
    alerts.concat(check_rate_reasonableness)
    alerts.concat(check_maturity)
    alerts.concat(check_no_payments)
    alerts.concat(check_missing_documents)
    alerts
  end

  def self.check_portfolio(user)
    user.loans.where(status: :active).includes(:user, :loan_documents).flat_map do |loan|
      new(loan).check_all.map { |alert| alert_to_hash(alert).merge(loan_id: loan.id, borrower_name: loan.display_borrower_name) }
    end
  end

  private

  def check_concentration
    total_capital = @user.total_capital
    return [] if total_capital.nil? || total_capital.zero? || @loan.principal.nil? || @loan.principal.zero?

    percentage = (@loan.principal.to_f / total_capital.to_f * 100).round(1)
    return [] if percentage < 30

    severity = percentage >= 50 ? :danger : :warning
    [Alert.new(
      type: :concentration,
      severity: severity,
      message: "This loan represents #{percentage}% of your total capital — consider diversifying.",
      detail: "Principal: $#{format_number(@loan.principal)}, Total capital: $#{format_number(total_capital)}"
    )]
  end

  def check_collateral
    return [] if @loan.collateral_description.present?

    [Alert.new(
      type: :collateral,
      severity: :warning,
      message: "No collateral documented for this loan.",
      detail: nil
    )]
  end

  def check_rate_reasonableness
    return [] if @loan.annual_rate.nil? || @loan.annual_rate.zero?

    range = suggested_rate_range
    return [] if range.nil?

    rate = @loan.annual_rate.to_f
    min_rate = range[:min].to_f
    max_rate = range[:max].to_f

    if rate > max_rate
      diff = rate - max_rate
      severity = diff > 3 ? :warning : :info
      [Alert.new(
        type: :rate,
        severity: severity,
        message: "Rate of #{rate}% is above the typical range of #{min_rate}%–#{max_rate}% for this loan type.",
        detail: "#{diff.round(1)} points above range"
      )]
    elsif rate < min_rate
      diff = min_rate - rate
      severity = diff > 3 ? :warning : :info
      [Alert.new(
        type: :rate,
        severity: severity,
        message: "Rate of #{rate}% is below the typical range of #{min_rate}%–#{max_rate}% for this loan type.",
        detail: "#{diff.round(1)} points below range"
      )]
    else
      []
    end
  end

  def check_maturity
    return [] unless @loan.active?
    return [] if @loan.start_date.nil? || @loan.term_months.nil?

    maturity_date = @loan.start_date >> @loan.term_months
    days_remaining = (maturity_date - Date.current).to_i
    return [] if days_remaining > 30 || days_remaining < 0

    severity = days_remaining <= 7 ? :danger : :warning
    [Alert.new(
      type: :maturity,
      severity: severity,
      message: "This loan matures on #{maturity_date.strftime('%B %-d, %Y')} — #{days_remaining} days remaining.",
      detail: nil
    )]
  end

  def check_no_payments
    return [] unless @loan.active?
    return [] if @loan.start_date.nil?

    days_since = (Date.current - @loan.start_date).to_i
    return [] if days_since <= 35
    return [] if @loan.payments_made_count > 0

    [Alert.new(
      type: :no_payments,
      severity: :warning,
      message: "No payments have been recorded for this loan since origination #{days_since} days ago.",
      detail: nil
    )]
  end

  def check_missing_documents
    not_on_file = @loan.loan_documents.where.not(status: "on_file").count
    return [] if not_on_file <= 0

    if not_on_file == 1
      [Alert.new(
        type: :missing_documents,
        severity: :info,
        message: "1 of 5 loan documents is not on file.",
        detail: nil
      )]
    else
      severity = not_on_file >= 3 ? :danger : :warning
      [Alert.new(
        type: :missing_documents,
        severity: severity,
        message: "#{not_on_file} of 5 loan documents are not on file.",
        detail: nil
      )]
    end
  end

  def suggested_rate_range
    # Use default mid-range inputs since we don't have LTV/property data on the loan itself.
    # The calculator gives a baseline range for the loan type.
    loan_type_to_property = {
      "standard" => :single_family,
      "interest_only" => :commercial,
      "balloon" => :single_family
    }

    result = Calculations::LoanPricingCalculator.call(
      ltv: 70,
      term_months: @loan.term_months,
      property_type: loan_type_to_property[@loan.loan_type] || :single_family,
      borrower_experience: :experienced
    )

    { min: result.suggested_rate_min, max: result.suggested_rate_max }
  rescue StandardError
    nil
  end

  def format_number(value)
    parts = value.to_f.round(2).to_s.split(".")
    parts[0] = parts[0].reverse.gsub(/(\d{3})(?=\d)/, '\\1,').reverse
    parts.join(".")
  end

  def self.alert_to_hash(alert)
    {
      type: alert.type.to_s,
      severity: alert.severity.to_s,
      message: alert.message,
      detail: alert.detail
    }
  end
end
