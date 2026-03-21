export interface PaymentRecord {
  id: number
  amount: number
  date: string
  principal_portion: number
  interest_portion: number
  late_fee: number
  note: string | null
}

export interface LoanProps {
  id: number
  borrower_name: string
  principal: number
  annual_rate: number
  term_months: number
  loan_type: 'standard' | 'interest_only' | 'balloon'
  status: 'active' | 'paid_off' | 'defaulted' | 'written_off'
  start_date: string
  purpose: string | null
  collateral_description: string | null
  notes: string | null
  created_at: string
  monthly_payment: number
  total_interest: number
  total_cost: number
  remaining_balance: number
  payments_made_count: number
  total_paid: number
  interest_earned: number
  principal_returned: number
  repayment_percentage: number
  next_payment_due: string | null
  days_since_start: number
  capital_percentage: number
  payments: PaymentRecord[]
}
