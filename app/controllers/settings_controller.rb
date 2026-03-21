class SettingsController < ApplicationController
  def index
    render inertia: "Settings/Index", props: {
      user: {
        business_name: current_user.business_name || "",
        total_capital: (current_user.total_capital || 0).to_f,
        email: current_user.email
      }
    }
  end

  def update
    if current_user.update(settings_params)
      redirect_to settings_path, notice: "Settings saved."
    else
      redirect_to settings_path, alert: current_user.errors.full_messages.join(", ")
    end
  end

  def reset_data
    current_user.expenses.delete_all
    current_user.loans.destroy_all  # cascades to payments via dependent: :destroy
    current_user.update!(total_capital: 0, business_name: nil)
    redirect_to settings_path, notice: "All data has been reset."
  end

  private

  def settings_params
    params.require(:user).permit(:business_name, :total_capital)
  end
end
