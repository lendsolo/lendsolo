class PaymentsController < ApplicationController
  def index
    all_payments = Payment.joins(:loan)
                         .where(loans: { user_id: current_user.id })
                         .includes(:loan)
                         .order(date: :desc)

    # Summary stats for current month
    month_start = Date.current.beginning_of_month
    month_payments = all_payments.where("payments.date >= ?", month_start)

    render inertia: "Payments/Index", props: {
      payments: all_payments.map { |p| serialize_payment(p) },
      loans: current_user.loans.order(:borrower_name).map { |l|
        { id: l.id, borrower_name: l.borrower_name }
      },
      stats: {
        total_collected_month: month_payments.sum(:amount).to_f,
        interest_earned_month: month_payments.sum(:interest_portion).to_f,
        principal_returned_month: month_payments.sum(:principal_portion).to_f
      }
    }
  end

  def create
    loan = current_user.loans.find(params[:loan_id])
    payment = loan.payments.build(payment_params)

    if payment.save
      redirect_back fallback_location: loan_path(loan), notice: "Payment recorded."
    else
      redirect_back fallback_location: loan_path(loan),
                    inertia: { errors: payment.errors.to_hash(true) },
                    alert: payment.errors.full_messages.join(", ")
    end
  end

  private

  def payment_params
    params.require(:payment).permit(:amount, :date, :note, :late_fee)
  end

  def serialize_payment(payment)
    {
      id: payment.id,
      amount: payment.amount.to_f,
      date: payment.date.to_s,
      principal_portion: payment.principal_portion.to_f,
      interest_portion: payment.interest_portion.to_f,
      late_fee: payment.late_fee.to_f,
      note: payment.note,
      loan_id: payment.loan_id,
      borrower_name: payment.loan.borrower_name
    }
  end
end
