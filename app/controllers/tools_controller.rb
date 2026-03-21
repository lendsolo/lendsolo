class ToolsController < ApplicationController
  skip_before_action :authenticate_user!
  skip_before_action :redirect_to_onboarding

  def amortization_calculator
    render inertia: "Tools/AmortizationCalculator"
  end

  def roi_calculator
    render inertia: "Tools/RoiCalculator"
  end

  def loan_comparison
    render inertia: "Tools/LoanComparison"
  end

  def interest_only_calculator
    render inertia: "Tools/InterestOnlyCalculator"
  end
end
