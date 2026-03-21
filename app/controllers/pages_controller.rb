class PagesController < ApplicationController
  skip_before_action :authenticate_user!

  def landing
    if user_signed_in?
      redirect_to dashboard_path
      return
    end

    render inertia: "Landing/Index"
  end
end
