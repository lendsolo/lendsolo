# Admin dashboard — owner-only.
# To grant admin access via Rails console:
#   User.find_by(email: 'your@email.com').update!(admin: true)
class AdminController < ApplicationController
  before_action :require_admin!

  def index
    stats = {
      users: {
        total: User.count,
        today: User.where(created_at: Time.current.beginning_of_day..).count,
        this_week: User.where(created_at: 1.week.ago..).count
      },
      subscriptions: {
        free: User.where(subscription_plan: "free").count,
        solo: User.where(subscription_plan: "solo").count,
        pro: User.where(subscription_plan: "pro").count,
        fund: User.where(subscription_plan: "fund").count
      },
      waitlist: {
        total: WaitlistEntry.count,
        fund: WaitlistEntry.where(tier: "fund").count
      },
      loans: {
        total: Loan.count,
        active: Loan.where(status: "active").count
      }
    }

    render inertia: "Admin/Index", props: { stats: stats }
  end

  private

  def require_admin!
    unless current_user&.admin?
      redirect_to root_path, alert: "Not authorized."
    end
  end
end
