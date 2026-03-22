export interface BorrowerSummary {
  id: number
  name: string
  email: string | null
  phone: string | null
  archived: boolean
  loan_count: number
  total_principal: number
  total_interest_received: number
  last_payment_date: string | null
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
