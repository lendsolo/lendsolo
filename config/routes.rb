Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations"
  }

  get "up" => "rails/health#show", as: :rails_health_check

  root "pages#landing"

  get "dashboard", to: "dashboard#index"
  resources :loans do
    member do
      patch :mark_paid_off
      patch :mark_defaulted
    end
    resources :payments, only: %i[create]
  end
  resources :payments, only: %i[index]
  resources :expenses, only: %i[index create destroy]
  get "import", to: "imports#new", as: :new_import
  post "import", to: "imports#create", as: :imports
  post "import/process", to: "imports#process_import", as: :process_import
  get "calculators", to: "calculators#index"
  get "settings", to: "settings#index"
  patch "settings", to: "settings#update"
  delete "settings/reset_data", to: "settings#reset_data"

  # Public calculator tools (no auth required)
  get "tools/loan-amortization-calculator", to: "tools#amortization_calculator"
  get "tools/roi-calculator", to: "tools#roi_calculator"
  get "tools/loan-comparison", to: "tools#loan_comparison"
  get "tools/interest-only-calculator", to: "tools#interest_only_calculator"
end
