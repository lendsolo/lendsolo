class Users::RegistrationsController < Devise::RegistrationsController
  def new
    render inertia: "Auth/Register"
  end

  def create
    build_resource(sign_up_params)

    if resource.save
      sign_up(resource_name, resource)
      redirect_to after_sign_up_path_for(resource)
    else
      redirect_to new_user_registration_path, inertia: { errors: resource.errors.to_hash }
    end
  end

  def after_sign_up_path_for(_resource)
    dashboard_path
  end

  private

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation, :business_name)
  end
end
