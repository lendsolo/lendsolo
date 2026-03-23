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

  get "admin", to: "admin#index"
  get "dashboard", to: "dashboard#index"
  resources :borrowers, except: [:destroy] do
    member do
      patch :archive
      patch :unarchive
      patch :update_notes
      post :reveal_tin
    end
  end
  resources :loans do
    member do
      patch :mark_paid_off
      patch :mark_defaulted
    end
    resources :payments, only: %i[create]
    resources :loan_documents, only: %i[update], path: "documents"
  end
  resources :payments, only: %i[index] do
    collection do
      get :export_csv
    end
  end
  resources :capital_transactions, only: %i[index create destroy]
  resources :expenses, only: %i[index create destroy] do
    member do
      patch :stop_recurring
      patch :resume_recurring
    end
    collection do
      get :export_csv
    end
  end
  get "import", to: "imports#new", as: :new_import
  post "import", to: "imports#create", as: :imports
  post "import/process", to: "imports#process_import", as: :process_import
  # Reports (PDF generation)
  get "reports", to: "reports#index"
  get "loans/:id/statement.pdf", to: "reports#loan_statement", as: :loan_statement_pdf
  get "loans/:id/amortization.pdf", to: "reports#amortization_schedule", as: :loan_amortization_pdf
  get "reports/year_end/:year.pdf", to: "reports#year_end", as: :year_end_report_pdf

  # Exports
  get "exports", to: "exports#index"
  get "exports/year_end_summary.pdf", to: "exports#year_end_summary_pdf", as: :export_pdf
  get "exports/year_end_summary.csv", to: "exports#year_end_summary_csv", as: :export_csv
  get "exports/quickbooks.qbo", to: "exports#quickbooks_qbo", as: :export_qbo
  get "exports/expenses.csv", to: "exports#expenses_csv", as: :export_expenses_csv

  get "settings", to: "settings#index"
  patch "settings", to: "settings#update"
  post "settings/send_test_email", to: "settings#send_test_email"
  delete "settings/reset_data", to: "settings#reset_data"

  # Billing & Subscriptions
  get "billing", to: "subscriptions#show"
  post "billing/subscribe", to: "subscriptions#create"
  post "billing/portal", to: "subscriptions#portal"

  # Stripe webhooks
  post "webhooks/stripe", to: "webhooks#stripe"

  # AI features (Pro gate)
  namespace :api do
    post "ai/deal_memo", to: "ai#deal_memo"
    post "ai/risk_narrative", to: "ai#risk_narrative"
  end

  # Waitlist (public)
  post "waitlist", to: "waitlist#create"

  # Public calculator tools (no auth required)
  get "calculators", to: "tools#index", as: :calculators
  get "tools/loan-amortization-calculator", to: "tools#amortization_calculator"
  get "tools/roi-calculator", to: "tools#roi_calculator"
  get "tools/loan-comparison", to: "tools#loan_comparison"
  get "tools/interest-only-calculator", to: "tools#interest_only_calculator"

  # Blog
  get "blog", to: "blog#index", as: :blog
  get "blog/feed.xml", to: "blog#feed", as: :blog_feed, defaults: { format: :xml }
  get "blog/:slug", to: "blog#show", as: :blog_post

  # SEO
  get "sitemap.xml", to: "sitemap#show", as: :sitemap, defaults: { format: :xml }
end
