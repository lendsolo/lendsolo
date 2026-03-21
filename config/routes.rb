Rails.application.routes.draw do
  devise_for :users, controllers: {
    sessions: "users/sessions",
    registrations: "users/registrations"
  }

  get "up" => "rails/health#show", as: :rails_health_check

  root "pages#landing"

  # Onboarding
  get "onboarding", to: "onboarding#show"
  post "onboarding/profile", to: "onboarding#update_profile"
  post "onboarding/seed", to: "onboarding#seed_sample_data"
  post "onboarding/complete", to: "onboarding#complete"

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
  # Exports
  get "exports", to: "exports#index"
  get "exports/year_end_summary.pdf", to: "exports#year_end_summary_pdf", as: :export_pdf
  get "exports/year_end_summary.csv", to: "exports#year_end_summary_csv", as: :export_csv
  get "exports/quickbooks.qbo", to: "exports#quickbooks_qbo", as: :export_qbo
  get "exports/expenses.csv", to: "exports#expenses_csv", as: :export_expenses_csv

  get "calculators", to: "calculators#index"
  get "settings", to: "settings#index"
  patch "settings", to: "settings#update"
  delete "settings/reset_data", to: "settings#reset_data"

  # Billing & Subscriptions
  get "billing", to: "subscriptions#show"
  post "billing/subscribe", to: "subscriptions#create"
  post "billing/portal", to: "subscriptions#portal"

  # Stripe webhooks
  post "webhooks/stripe", to: "webhooks#stripe"

  # Public calculator tools (no auth required)
  get "tools/loan-amortization-calculator", to: "tools#amortization_calculator"
  get "tools/roi-calculator", to: "tools#roi_calculator"
  get "tools/loan-comparison", to: "tools#loan_comparison"
  get "tools/interest-only-calculator", to: "tools#interest_only_calculator"
end
