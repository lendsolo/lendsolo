class OnboardingController < ApplicationController
  skip_before_action :redirect_to_onboarding

  def show
    if current_user.has_completed_onboarding
      redirect_to dashboard_path
      return
    end

    render inertia: "Onboarding/Show", props: {
      user: {
        business_name: current_user.business_name || "",
        total_capital: (current_user.total_capital || 0).to_f
      }
    }
  end

  def update_profile
    current_user.update!(
      business_name: params[:business_name].presence,
      total_capital: params[:total_capital].presence || 0
    )

    render inertia: "Onboarding/Show", props: {
      user: {
        business_name: current_user.business_name || "",
        total_capital: (current_user.total_capital || 0).to_f
      },
      profile_saved: true
    }
  end

  def seed_sample_data
    ActiveRecord::Base.transaction do
      # Create borrower records
      maria = current_user.borrowers.find_or_create_by!(name: "Maria Rodriguez")
      james = current_user.borrowers.find_or_create_by!(name: "James Chen")
      priya = current_user.borrowers.find_or_create_by!(name: "Priya Sharma")

      # Loan 1: Standard 12-month, $25K at 10%, 4 payments made
      loan1 = current_user.loans.create!(
        borrower: maria,
        borrower_name: "Maria Rodriguez",
        principal: 25_000,
        annual_rate: 10.0,
        term_months: 12,
        loan_type: "standard",
        start_date: 6.months.ago.to_date,
        status: "active",
        purpose: "Small business expansion",
        collateral_description: "2019 Ford Transit van, VIN #1FTBW2CM3KKA12345",
        notes: "Sample data — Maria runs a catering business and needed capital for a second van."
      )

      # Record 4 payments for loan1
      4.times do |i|
        payment_date = loan1.start_date >> (i + 1)
        loan1.payments.create!(
          amount: loan1.monthly_payment,
          date: payment_date
        )
      end

      # Loan 2: Interest-only, $15K at 12%, 2 payments made
      loan2 = current_user.loans.create!(
        borrower: james,
        borrower_name: "James Chen",
        principal: 15_000,
        annual_rate: 12.0,
        term_months: 24,
        loan_type: "interest_only",
        start_date: 3.months.ago.to_date,
        status: "active",
        purpose: "Equipment purchase",
        collateral_description: "Commercial espresso machine, Rancilio Classe 11",
        notes: "Sample data — James opened a coffee shop and needed equipment financing."
      )

      2.times do |i|
        payment_date = loan2.start_date >> (i + 1)
        loan2.payments.create!(
          amount: loan2.monthly_payment,
          date: payment_date
        )
      end

      # Sample document statuses for loan 1: all on_file except personal_guarantee
      loan1.loan_documents.find_by(document_type: "promissory_note")&.update!(status: "on_file")
      loan1.loan_documents.find_by(document_type: "deed_of_trust")&.update!(status: "on_file")
      loan1.loan_documents.find_by(document_type: "title_insurance")&.update!(status: "on_file", notes: "Policy #TI-2026-0412")
      loan1.loan_documents.find_by(document_type: "hazard_insurance")&.update!(status: "on_file", notes: "Exp 12/31/2026")

      # Sample document statuses for loan 2: only promissory_note on_file
      loan2.loan_documents.find_by(document_type: "promissory_note")&.update!(status: "on_file")

      # Loan 3: New standard loan, $20K at 11%, 0 payments (triggers guardrails)
      current_user.loans.create!(
        borrower: priya,
        borrower_name: "Priya Sharma",
        principal: 20_000,
        annual_rate: 11.0,
        term_months: 18,
        loan_type: "standard",
        start_date: 1.month.ago.to_date,
        status: "active",
        purpose: "Inventory financing",
        notes: "Sample data — Priya runs an online retail store and needed inventory capital. No collateral on file."
      )
    end

    current_user.update!(has_completed_onboarding: true)
    redirect_to dashboard_path, notice: "Sample data loaded! Explore your dashboard."
  end

  def complete
    current_user.update!(has_completed_onboarding: true)
    redirect_to dashboard_path
  end
end
