# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_03_21_021547) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  # Custom types defined in this database.
  # Note that some types may not work with other database engines. Be careful if changing database.
  create_enum "expense_category", ["legal", "filing", "software", "marketing", "insurance", "travel", "office", "other"]
  create_enum "loan_status", ["active", "paid_off", "defaulted", "written_off"]
  create_enum "loan_type", ["standard", "interest_only", "balloon"]
  create_enum "subscription_plan", ["free", "solo", "pro", "fund"]

  create_table "expenses", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "description", null: false
    t.decimal "amount", precision: 12, scale: 2, null: false
    t.enum "category", default: "other", null: false, enum_type: "expense_category"
    t.date "date", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_expenses_on_user_id"
  end

  create_table "loans", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "borrower_name", null: false
    t.decimal "principal", precision: 12, scale: 2, null: false
    t.decimal "annual_rate", precision: 5, scale: 2, null: false
    t.integer "term_months", null: false
    t.enum "loan_type", default: "standard", null: false, enum_type: "loan_type"
    t.date "start_date", null: false
    t.enum "status", default: "active", null: false, enum_type: "loan_status"
    t.string "purpose"
    t.text "collateral_description"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_loans_on_user_id"
  end

  create_table "payments", force: :cascade do |t|
    t.bigint "loan_id", null: false
    t.decimal "amount", precision: 12, scale: 2, null: false
    t.date "date", null: false
    t.decimal "principal_portion", precision: 12, scale: 2, null: false
    t.decimal "interest_portion", precision: 12, scale: 2, null: false
    t.decimal "late_fee", precision: 12, scale: 2, default: "0.0"
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["loan_id"], name: "index_payments_on_loan_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "business_name"
    t.decimal "total_capital", precision: 12, scale: 2, default: "0.0"
    t.boolean "has_completed_onboarding", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "stripe_customer_id"
    t.string "stripe_subscription_id"
    t.enum "subscription_plan", default: "free", null: false, enum_type: "subscription_plan"
    t.string "subscription_status", default: "incomplete", null: false
    t.datetime "trial_ends_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["stripe_customer_id"], name: "index_users_on_stripe_customer_id", unique: true
  end

  add_foreign_key "expenses", "users"
  add_foreign_key "loans", "users"
  add_foreign_key "payments", "loans"
end
