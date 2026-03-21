class ApplicationController < ActionController::Base
  before_action :authenticate_user!
  before_action :redirect_to_onboarding

  inertia_share do
    {
      current_user: current_user&.as_json(only: %i[id email business_name total_capital has_completed_onboarding]),
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
end
