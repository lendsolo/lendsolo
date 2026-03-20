class PaymentsController < ApplicationController
  def index
    render inertia: "Payments/Index"
  end
end
