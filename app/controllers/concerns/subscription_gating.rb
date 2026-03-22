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

  # Solo tier or above (solo, pro, fund)
  def enforce_solo_gate!
    return unless current_user

    unless %w[solo pro fund].include?(current_user.effective_plan)
      redirect_to billing_path,
        alert: "This feature requires the Solo plan ($19/mo) or above. Upgrade to access it."
    end
  end

  # Pro tier or above (pro, fund)
  def enforce_pro_gate!
    return unless current_user

    unless %w[pro fund].include?(current_user.effective_plan)
      redirect_to billing_path,
        alert: "This feature requires the Pro plan ($39/mo) or above. Upgrade to access it."
    end
  end

  def solo_or_above?
    current_user && %w[solo pro fund].include?(current_user.effective_plan)
  end

  def pro_or_above?
    current_user && %w[pro fund].include?(current_user.effective_plan)
  end
end
