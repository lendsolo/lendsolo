export interface BorrowerSummary {
  id: number
  name: string
  email: string | null
  phone: string | null
  archived: boolean
  status: 'active' | 'paid_off' | 'archived' | 'none'
  loan_count: number
  active_loan_count: number
  total_principal: number
  total_interest_received: number
  last_payment_date: string | null
  last_activity: string | null
}

export interface BorrowerDetail {
  id: number
  name: string
  email: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  zip: string | null
  notes: string | null
  tin: string | null
  archived: boolean
  created_at: string
}

export interface BorrowerPayment {
  id: number
  date: string
  amount: number
  principal_portion: number
  interest_portion: number
  late_fee: number
  note: string | null
  loan_id: number
  loan_label: string
}

export interface BorrowerStats {
  active_loans: number
  total_principal: number
  interest_earned: number
  avg_rate: number
}
