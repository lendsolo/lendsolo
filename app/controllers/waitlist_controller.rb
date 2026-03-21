class WaitlistController < ApplicationController
  skip_before_action :authenticate_user!
  skip_before_action :redirect_to_onboarding

  def create
    entry = WaitlistEntry.new(
      email: params[:email]&.strip&.downcase,
      tier: params[:tier] || "fund"
    )

    if entry.save
      render json: { success: true, message: "You're on the list!" }
    elsif entry.errors[:email]&.include?("is already on the waitlist")
      render json: { success: true, message: "You're already on the list!" }
    else
      render json: { success: false, message: entry.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end
end
