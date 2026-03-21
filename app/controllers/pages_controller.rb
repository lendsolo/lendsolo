class PagesController < ApplicationController
  skip_before_action :authenticate_user!
  skip_before_action :redirect_to_onboarding

  def landing
    if user_signed_in?
      if current_user.has_completed_onboarding
        redirect_to dashboard_path
      else
        redirect_to onboarding_path
      end
      return
    end

    render inertia: "Landing/Index"
  end
end
