class ApplicationController < ActionController::Base
  include SubscriptionGating

  before_action :authenticate_user!
  before_action :redirect_to_onboarding

  inertia_share do
    {
      current_user: current_user ? serialize_current_user : nil,
      flash: {
        notice: flash[:notice],
        alert: flash[:alert]
      }
    }
  end

  private

  def redirect_to_onboarding
    return unless current_user
    return if current_user.has_completed_onboarding

    redirect_to onboarding_path unless request.path.start_with?("/onboarding")
  end

  def serialize_current_user
    {
      id: current_user.id,
      email: current_user.email,
      business_name: current_user.business_name,
      total_capital: current_user.total_capital.to_f,
      has_completed_onboarding: current_user.has_completed_onboarding,
      subscription_plan: current_user.subscription_plan,
      subscription_status: current_user.subscription_status,
      effective_plan: current_user.effective_plan,
      on_trial: current_user.on_trial?,
      trial_days_remaining: current_user.trial_days_remaining,
      trial_expired: current_user.trial_expired?,
      active_loan_count: current_user.active_loan_count,
      loan_limit: current_user.effective_loan_limit.infinite? ? nil : current_user.effective_loan_limit.to_i
    }
  end
end
