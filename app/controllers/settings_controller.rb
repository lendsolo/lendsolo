class SettingsController < ApplicationController
  def index
    render inertia: "Settings/Index"
  end
end
