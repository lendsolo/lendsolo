module SubscriptionGating
  extend ActiveSupport::Concern

  private

  def enforce_loan_limit!
    return unless current_user

    unless current_user.can_create_loan_with_plan?
      limit = current_user.effective_loan_limit
      plan = current_user.effective_plan
      redirect_to billing_path,
        alert: "You've reached the #{limit}-loan limit on the #{plan.titleize} plan. Upgrade to create more loans."
    end
  end
end
