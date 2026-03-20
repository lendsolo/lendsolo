class ApplicationController < ActionController::Base
  before_action :authenticate_user!

  inertia_share do
    {
      current_user: current_user&.as_json(only: %i[id email business_name total_capital has_completed_onboarding]),
      flash: {
        notice: flash[:notice],
        alert: flash[:alert]
      }
    }
  end
end
