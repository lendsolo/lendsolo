class LoansController < ApplicationController
  def index
    render inertia: "Loans/Index"
  end

  def show
    render inertia: "Loans/Show"
  end
end
