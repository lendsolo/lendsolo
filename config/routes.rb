Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations"
  }

  get "up" => "rails/health#show", as: :rails_health_check

  root "dashboard#index"

  get "dashboard", to: "dashboard#index"
  resources :loans, only: %i[index show]
  resources :payments, only: %i[index]
  resources :expenses, only: %i[index]
  get "calculators", to: "calculators#index"
  get "settings", to: "settings#index"
end
