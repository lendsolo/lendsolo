class ExpensesController < ApplicationController
  def index
    render inertia: "Expenses/Index"
  end
end
