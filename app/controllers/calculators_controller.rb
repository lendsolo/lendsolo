class CalculatorsController < ApplicationController
  def index
    render inertia: "Calculators/Index"
  end
end
