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

ActiveRecord::Schema[8.0].define(version: 2026_03_23_015358) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  # Custom types defined in this database.
  # Note that some types may not work with other database engines. Be careful if changing database.
  create_enum "expense_category", ["legal", "filing", "software", "marketing", "insurance", "travel", "office", "other"]
  create_enum "loan_status", ["active", "paid_off", "defaulted", "written_off"]
  create_enum "loan_type", ["standard", "interest_only", "balloon"]
  create_enum "subscription_plan", ["free", "solo", "pro", "fund"]

  create_table "borrowers", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", null: false
    t.string "email"
    t.string "phone"
    t.string "address_line1"
    t.string "address_line2"
    t.string "city"
    t.string "state"
    t.string "zip"
    t.text "notes"
    t.string "tin"
    t.boolean "archived", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "name"], name: "index_borrowers_on_user_id_and_name"
    t.index ["user_id"], name: "index_borrowers_on_user_id"
  end

  create_table "capital_transactions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "transaction_type", null: false
    t.decimal "amount", precision: 12, scale: 2, null: false
    t.date "date", null: false
    t.string "source"
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "date"], name: "index_capital_transactions_on_user_id_and_date"
    t.index ["user_id"], name: "index_capital_transactions_on_user_id"
  end

  create_table "email_logs", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "loan_id"
    t.string "email_type", null: false
    t.string "recipient_email", null: false
    t.integer "payment_number"
    t.date "reference_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["loan_id", "email_type", "payment_number", "reference_date"], name: "idx_email_logs_unique_send", unique: true
    t.index ["loan_id"], name: "index_email_logs_on_loan_id"
    t.index ["user_id"], name: "index_email_logs_on_user_id"
  end

  create_table "expenses", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "description", null: false
    t.decimal "amount", precision: 12, scale: 2, null: false
    t.enum "category", default: "other", null: false, enum_type: "expense_category"
    t.date "date", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "recurring", default: false, null: false
    t.string "frequency"
    t.date "next_occurrence_date"
    t.bigint "recurring_parent_id"
    t.boolean "active", default: true, null: false
    t.index ["recurring", "active", "next_occurrence_date"], name: "index_expenses_on_recurring_active_next_date"
    t.index ["recurring_parent_id"], name: "index_expenses_on_recurring_parent_id"
    t.index ["user_id"], name: "index_expenses_on_user_id"
  end

  create_table "loan_documents", force: :cascade do |t|
    t.bigint "loan_id", null: false
    t.string "document_type", null: false
    t.string "status", default: "missing", null: false
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["loan_id", "document_type"], name: "index_loan_documents_on_loan_id_and_document_type", unique: true
    t.index ["loan_id"], name: "index_loan_documents_on_loan_id"
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
    t.bigint "borrower_id"
    t.date "cached_next_payment_date"
    t.decimal "cached_next_payment_amount", precision: 12, scale: 2
    t.index ["borrower_id"], name: "index_loans_on_borrower_id"
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

  create_table "solid_queue_blocked_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.string "concurrency_key", null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.index ["concurrency_key", "priority", "job_id"], name: "index_solid_queue_blocked_executions_for_release"
    t.index ["expires_at", "concurrency_key"], name: "index_solid_queue_blocked_executions_for_maintenance"
    t.index ["job_id"], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
  end

  create_table "solid_queue_claimed_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.bigint "process_id"
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
  end

  create_table "solid_queue_failed_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.text "error"
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_executions_on_job_id", unique: true
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "queue_name", null: false
    t.string "class_name", null: false
    t.text "arguments"
    t.integer "priority", default: 0, null: false
    t.string "active_job_id"
    t.datetime "scheduled_at"
    t.datetime "finished_at"
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active_job_id"], name: "index_solid_queue_jobs_on_active_job_id"
    t.index ["class_name"], name: "index_solid_queue_jobs_on_class_name"
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_for_filtering"
    t.index ["scheduled_at", "finished_at"], name: "index_solid_queue_jobs_for_alerting"
  end

  create_table "solid_queue_pauses", force: :cascade do |t|
    t.string "queue_name", null: false
    t.datetime "created_at", null: false
    t.index ["queue_name"], name: "index_solid_queue_pauses_on_queue_name", unique: true
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.bigint "supervisor_id"
    t.integer "pid", null: false
    t.string "hostname"
    t.text "metadata"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["name", "supervisor_id"], name: "index_solid_queue_processes_on_name_and_supervisor_id", unique: true
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    t.index ["priority", "job_id"], name: "index_solid_queue_poll_all"
    t.index ["queue_name", "priority", "job_id"], name: "index_solid_queue_poll_by_queue"
  end

  create_table "solid_queue_recurring_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "task_key", null: false
    t.datetime "run_at", null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
    t.index ["task_key", "run_at"], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
  end

  create_table "solid_queue_recurring_tasks", force: :cascade do |t|
    t.string "key", null: false
    t.string "schedule", null: false
    t.string "command", limit: 2048
    t.string "class_name"
    t.text "arguments"
    t.string "queue_name"
    t.integer "priority", default: 0
    t.boolean "static", default: true, null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    t.index ["static"], name: "index_solid_queue_recurring_tasks_on_static"
  end

  create_table "solid_queue_scheduled_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.datetime "scheduled_at", null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    t.index ["scheduled_at", "priority", "job_id"], name: "index_solid_queue_dispatch_all"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.string "key", null: false
    t.integer "value", default: 1, null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value"
    t.index ["key"], name: "index_solid_queue_semaphores_on_key", unique: true
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
    t.boolean "email_reminders_enabled", default: true, null: false
    t.boolean "email_receipts_enabled", default: true, null: false
    t.boolean "email_late_notices_enabled", default: true, null: false
    t.boolean "email_monthly_summary_enabled", default: true, null: false
    t.integer "reminder_days_before", default: 5, null: false
    t.integer "late_notice_days_after", default: 3, null: false
    t.string "borrower_notification_email"
    t.boolean "admin", default: false, null: false
    t.string "lender_tin"
    t.string "lender_street_address"
    t.string "lender_city"
    t.string "lender_state"
    t.string "lender_zip"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["stripe_customer_id"], name: "index_users_on_stripe_customer_id", unique: true
  end

  create_table "waitlist_entries", force: :cascade do |t|
    t.string "email", null: false
    t.string "tier", default: "fund", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email", "tier"], name: "index_waitlist_entries_on_email_and_tier", unique: true
  end

  add_foreign_key "borrowers", "users"
  add_foreign_key "capital_transactions", "users"
  add_foreign_key "email_logs", "loans"
  add_foreign_key "email_logs", "users"
  add_foreign_key "expenses", "expenses", column: "recurring_parent_id"
  add_foreign_key "expenses", "users"
  add_foreign_key "loan_documents", "loans"
  add_foreign_key "loans", "borrowers"
  add_foreign_key "loans", "users"
  add_foreign_key "payments", "loans"
  add_foreign_key "solid_queue_blocked_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_claimed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_failed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_recurring_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_scheduled_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
end
