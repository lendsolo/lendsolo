source "https://rubygems.org"

gem "rails", "~> 8.0.4"
gem "propshaft"
gem "pg", "~> 1.1"
gem "puma", ">= 5.0"
gem "tzinfo-data", platforms: %i[ windows jruby ]
gem "solid_queue"
gem "bootsnap", require: false
gem "thruster", require: false

# Inertia.js adapter
gem "inertia_rails"

# Vite for JS/CSS bundling
gem "vite_rails"

# Authentication
gem "devise"

# Spreadsheet parsing for imports
gem "roo", "~> 2.10"

# Stripe payments
gem "stripe", "~> 13.0"

# PDF generation
gem "prawn", "~> 2.5"
gem "prawn-table", "~> 0.2"

# ZIP archive generation
gem "rubyzip", "~> 2.3"

# Transactional email via Resend
gem "resend", "~> 1.0"

# Anthropic API for AI features
gem "anthropic", "~> 1.25"

group :development, :test do
  gem "dotenv-rails"
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
  gem "brakeman", require: false
  gem "rubocop-rails-omakase", require: false
  gem "rspec-rails"
  gem "factory_bot_rails"
end

group :development do
  gem "web-console"
end

gem "front_matter_parser", "~> 1.0"
gem "redcarpet", "~> 3.6"
gem "rouge", "~> 4.7"
