module Api
  class AiController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :require_pro_plan!

    # POST /api/ai/deal_memo
    def deal_memo
      loan = current_user.loans.find(params[:loan_id])
      loan_data = loan.as_inertia_props(total_capital: current_user.total_capital)

      prompt = build_deal_memo_prompt(loan_data, current_user)

      begin
        client = Anthropic::Client.new
        response = client.messages(
          parameters: {
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }]
          }
        )

        text = response.dig("content", 0, "text")
        render json: { success: true, memo: text }
      rescue => e
        Rails.logger.error "[AI::DealMemo] Failed for loan ##{loan.id}: #{e.message}"
        render json: { success: false, error: "Unable to generate deal memo." }, status: :service_unavailable
      end
    end

    # POST /api/ai/risk_narrative
    def risk_narrative
      loan = current_user.loans.find(params[:loan_id])
      loan_data = loan.as_inertia_props(total_capital: current_user.total_capital)

      # Check for any risk factors — skip if none
      has_risk = loan_data[:capital_percentage] > 30 ||
                 loan_data[:overdue] ||
                 !loan.collateral_description.present? ||
                 loan_data[:annual_rate] > 15 ||
                 loan_data[:days_since_start] > 30 && loan_data[:payments_made_count] == 0

      unless has_risk
        render json: { success: true, narrative: nil }
        return
      end

      # Check cache
      cache_key = "risk_narrative:#{loan.id}:#{loan.updated_at.to_i}:#{loan.payments.maximum(:updated_at)&.to_i}"
      cached = Rails.cache.read(cache_key)
      if cached
        render json: { success: true, narrative: cached }
        return
      end

      prompt = build_risk_narrative_prompt(loan_data, loan)

      begin
        client = Anthropic::Client.new
        response = client.messages(
          parameters: {
            model: "claude-sonnet-4-20250514",
            max_tokens: 400,
            messages: [{ role: "user", content: prompt }]
          }
        )

        text = response.dig("content", 0, "text")
        Rails.cache.write(cache_key, text, expires_in: 24.hours)
        render json: { success: true, narrative: text }
      rescue => e
        Rails.logger.error "[AI::RiskNarrative] Failed for loan ##{loan.id}: #{e.message}"
        render json: { success: false, error: "Unable to generate risk assessment." }, status: :service_unavailable
      end
    end

    private

    def require_pro_plan!
      unless %w[pro fund].include?(current_user.effective_plan)
        render json: {
          success: false,
          error: "AI features require a Pro plan. Upgrade at /billing to unlock."
        }, status: :forbidden
        return
      end

      unless ENV["ANTHROPIC_API_KEY"].present?
        Rails.logger.error "[AI] ANTHROPIC_API_KEY not configured"
        render json: { success: false, error: "AI features are not configured." }, status: :service_unavailable
      end
    end

    def build_deal_memo_prompt(loan_data, user)
      <<~PROMPT
        You are an experienced private lending advisor. Write a professional deal memo for the following loan.
        Write 2-3 paragraphs in a professional tone that reads like it came from an experienced private lender.
        Do NOT use markdown headers, bullet points, or formatting — write in clean prose paragraphs only.

        Loan Details:
        - Borrower: #{loan_data[:borrower_name]}
        - Principal: $#{format_number(loan_data[:principal])}
        - Interest Rate: #{loan_data[:annual_rate]}% annual
        - Term: #{loan_data[:term_months]} months
        - Loan Type: #{loan_data[:loan_type].humanize}
        - Purpose: #{loan_data[:purpose] || 'Not specified'}
        - Collateral: #{loan_data[:collateral_description] || 'None documented'}
        - Monthly Payment: $#{format_number(loan_data[:monthly_payment])}
        - Portfolio Concentration: #{loan_data[:capital_percentage]}% of total capital#{user.total_capital.to_f > 0 ? " ($#{format_number(user.total_capital.to_f)} total)" : ''}
        - Start Date: #{loan_data[:start_date]}
        - Status: #{loan_data[:status]}
        - Payments Made: #{loan_data[:payments_made_count]} of #{loan_data[:term_months]}
        - Remaining Balance: $#{format_number(loan_data[:remaining_balance])}

        Include in the memo:
        1. Loan summary (borrower, amount, rate, term, structure)
        2. Collateral description and coverage assessment
        3. Risk factors (concentration, loan type, rate positioning)
        4. Rate rationale (why this rate is appropriate)
        5. Any recommended terms, conditions, or precautions

        Keep it concise — 2-3 paragraphs maximum. Professional lending tone.
      PROMPT
    end

    def build_risk_narrative_prompt(loan_data, loan)
      days_since_last_payment = if loan.payments.any?
        (Date.current - loan.payments.order(:date).last.date).to_i
      else
        loan_data[:days_since_start]
      end

      <<~PROMPT
        You are a risk analyst for a private lending portfolio. Write a brief risk assessment (2-3 sentences) for this loan.
        Be specific, direct, and actionable. Do NOT use markdown, bullet points, or headers — write in plain prose.
        Reference the actual numbers. If risk is low, say so briefly.

        Loan Metrics:
        - Borrower: #{loan_data[:borrower_name]}
        - Principal: $#{format_number(loan_data[:principal])}
        - Rate: #{loan_data[:annual_rate]}%
        - Term: #{loan_data[:term_months]} months (#{loan_data[:term_months] - loan_data[:payments_made_count]} remaining)
        - Loan Type: #{loan_data[:loan_type].humanize}
        - Portfolio Concentration: #{loan_data[:capital_percentage]}% of total capital
        - Collateral: #{loan_data[:collateral_description].present? ? 'Documented' : 'NOT documented'}
        - Overdue: #{loan_data[:overdue] ? "Yes, #{loan_data[:days_overdue]} days" : 'No'}
        - Days Since Last Payment: #{days_since_last_payment}
        - Payments Made: #{loan_data[:payments_made_count]} of #{loan_data[:term_months]}
        - Remaining Balance: $#{format_number(loan_data[:remaining_balance])}

        Write 2-3 sentences assessing the risk. Be specific about what the numbers mean for this lender's portfolio.
        If action is recommended, state it clearly.
      PROMPT
    end

    def format_number(value)
      ActiveSupport::NumberHelper.number_to_delimited(
        ActiveSupport::NumberHelper.number_to_rounded(value, precision: 2),
        delimiter: ","
      )
    end
  end
end
