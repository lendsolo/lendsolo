// ─── Amortization Calculator ────────────────────────────────────────────────

export type LoanType = 'standard' | 'interest_only' | 'balloon'

export interface ScheduleRow {
  month: number
  dueDate: string
  payment: number
  principalPortion: number
  interestPortion: number
  remainingBalance: number
}

export interface AmortizationResult {
  monthlyPayment: number
  totalInterest: number
  totalCost: number
  schedule: ScheduleRow[]
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export function calculateAmortization(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: Date,
  loanType: LoanType = 'standard',
): AmortizationResult {
  if (termMonths <= 0) {
    return { monthlyPayment: 0, totalInterest: 0, totalCost: principal, schedule: [] }
  }

  const monthlyRate = annualRate / 1200

  let schedule: ScheduleRow[]

  if (loanType === 'standard') {
    schedule = buildStandardSchedule(principal, monthlyRate, termMonths, startDate)
  } else {
    // interest_only and balloon are the same schedule
    schedule = buildInterestOnlySchedule(principal, monthlyRate, termMonths, startDate)
  }

  const totalInterest = round2(schedule.reduce((sum, row) => sum + row.interestPortion, 0))
  const totalCost = round2(principal + totalInterest)
  const monthlyPayment = schedule.length > 0 ? schedule[0].payment : 0

  return { monthlyPayment, totalInterest, totalCost, schedule }
}

function buildStandardSchedule(
  principal: number,
  monthlyRate: number,
  termMonths: number,
  startDate: Date,
): ScheduleRow[] {
  let payment: number
  if (monthlyRate === 0) {
    payment = round2(principal / termMonths)
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths)
    payment = round2((principal * monthlyRate * factor) / (factor - 1))
  }

  let balance = principal
  const schedule: ScheduleRow[] = []

  for (let i = 0; i < termMonths; i++) {
    const interest = round2(balance * monthlyRate)
    let principalPortion: number
    let thisPayment: number

    if (i === termMonths - 1) {
      principalPortion = round2(balance)
      thisPayment = round2(principalPortion + interest)
    } else {
      principalPortion = round2(payment - interest)
      if (principalPortion < 0) principalPortion = 0
      thisPayment = payment
    }

    balance = round2(balance - principalPortion)
    if (balance < 0) balance = 0

    schedule.push({
      month: i + 1,
      dueDate: formatDate(addMonths(startDate, i + 1)),
      payment: thisPayment,
      principalPortion,
      interestPortion: interest,
      remainingBalance: balance,
    })
  }

  return schedule
}

function buildInterestOnlySchedule(
  principal: number,
  monthlyRate: number,
  termMonths: number,
  startDate: Date,
): ScheduleRow[] {
  const interestPayment = round2(principal * monthlyRate)
  const schedule: ScheduleRow[] = []

  for (let i = 0; i < termMonths; i++) {
    if (i === termMonths - 1) {
      schedule.push({
        month: i + 1,
        dueDate: formatDate(addMonths(startDate, i + 1)),
        payment: round2(principal + interestPayment),
        principalPortion: principal,
        interestPortion: interestPayment,
        remainingBalance: 0,
      })
    } else {
      schedule.push({
        month: i + 1,
        dueDate: formatDate(addMonths(startDate, i + 1)),
        payment: interestPayment,
        principalPortion: 0,
        interestPortion: interestPayment,
        remainingBalance: principal,
      })
    }
  }

  return schedule
}

// ─── Interest-Only Calculator (convenience wrapper) ─────────────────────────

export interface InterestOnlyResult {
  monthlyInterestPayment: number
  balloonPayment: number
  totalInterest: number
  totalCost: number
  schedule: ScheduleRow[]
}

export function calculateInterestOnly(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: Date,
): InterestOnlyResult {
  if (termMonths <= 0 || principal <= 0) {
    return { monthlyInterestPayment: 0, balloonPayment: principal, totalInterest: 0, totalCost: principal, schedule: [] }
  }

  const monthlyRate = annualRate / 1200
  const monthlyInterestPayment = round2(principal * monthlyRate)
  const totalInterest = round2(monthlyInterestPayment * termMonths)
  const totalCost = round2(principal + totalInterest)
  const balloonPayment = principal

  const schedule = buildInterestOnlySchedule(principal, monthlyRate, termMonths, startDate)

  return { monthlyInterestPayment, balloonPayment, totalInterest, totalCost, schedule }
}

// ─── ROI Calculator ─────────────────────────────────────────────────────────

export interface RoiResult {
  netProfit: number
  roiPercent: number
  annualizedRoi: number
  cashOnCashReturn: number
}

export function calculateRoi(
  purchasePrice: number,
  rehabCost: number,
  holdingCosts: number,
  salePrice: number,
  loanAmount: number,
  loanRate: number,
  holdMonths: number,
): RoiResult {
  const totalInvestment = purchasePrice + rehabCost + holdingCosts
  const cashInvested = totalInvestment - loanAmount
  const interestCost = round2((loanAmount * loanRate / 100) * (holdMonths / 12))
  const totalCosts = totalInvestment + interestCost
  const netProfit = round2(salePrice - totalCosts)

  const roiPercent = totalInvestment === 0 ? 0 : round2((netProfit / totalInvestment) * 100)
  const annualizedRoi = holdMonths === 0 || totalInvestment === 0 ? 0 : round2((roiPercent * 12) / holdMonths)
  const cashOnCashReturn = cashInvested === 0 ? 0 : round2((netProfit / cashInvested) * 100)

  return { netProfit, roiPercent, annualizedRoi, cashOnCashReturn }
}

// ─── LTV Calculator ─────────────────────────────────────────────────────────

export type RiskRating = 'low' | 'medium' | 'high'

export interface LtvResult {
  ratio: number
  riskRating: RiskRating
}

export function calculateLtv(loanAmount: number, propertyValue: number): LtvResult {
  const ratio = propertyValue === 0 ? 0 : round2((loanAmount / propertyValue) * 100)

  let riskRating: RiskRating
  if (ratio <= 65) {
    riskRating = 'low'
  } else if (ratio <= 80) {
    riskRating = 'medium'
  } else {
    riskRating = 'high'
  }

  return { ratio, riskRating }
}

// ─── Loan Pricing Calculator ────────────────────────────────────────────────

export type PropertyType = 'single_family' | 'multi_family' | 'commercial' | 'land'
export type BorrowerExperience = 'first_time' | 'limited' | 'experienced' | 'seasoned'

export interface LoanPricingResult {
  suggestedRateMin: number
  suggestedRateMax: number
  riskScore: number
  riskFactors: string[]
}

export function calculateLoanPricing(
  ltv: number,
  termMonths: number,
  propertyType: PropertyType,
  borrowerExperience: BorrowerExperience,
): LoanPricingResult {
  const BASE_RATE_MIN = 8
  const BASE_RATE_MAX = 10

  const adjustments: number[] = []
  const riskFactors: string[] = []
  let riskScore = 0

  // LTV risk
  if (ltv > 80) {
    adjustments.push(3)
    riskFactors.push(`High LTV (${ltv}%) — above 80% threshold`)
    riskScore += 30
  } else if (ltv > 70) {
    adjustments.push(1.5)
    riskFactors.push(`Moderate LTV (${ltv}%) — 70-80% range`)
    riskScore += 15
  } else if (ltv > 65) {
    adjustments.push(0.5)
    riskFactors.push(`Slightly elevated LTV (${ltv}%)`)
    riskScore += 5
  }

  // Term risk
  if (termMonths > 24) {
    adjustments.push(1.5)
    riskFactors.push(`Long term (${termMonths} months) — higher duration risk`)
    riskScore += 15
  } else if (termMonths > 12) {
    adjustments.push(0.5)
    riskFactors.push(`Medium term (${termMonths} months)`)
    riskScore += 5
  }

  // Property type risk
  switch (propertyType) {
    case 'land':
      adjustments.push(3)
      riskFactors.push('Raw land — illiquid collateral, difficult to value')
      riskScore += 25
      break
    case 'commercial':
      adjustments.push(1.5)
      riskFactors.push('Commercial property — specialized market')
      riskScore += 15
      break
    case 'multi_family':
      adjustments.push(0.5)
      riskFactors.push('Multi-family — moderate complexity')
      riskScore += 5
      break
    case 'single_family':
      break
  }

  // Borrower experience
  switch (borrowerExperience) {
    case 'first_time':
      adjustments.push(2)
      riskFactors.push('First-time borrower — no track record')
      riskScore += 20
      break
    case 'limited':
      adjustments.push(1)
      riskFactors.push('Limited experience (1-3 deals)')
      riskScore += 10
      break
    case 'experienced':
      break
    case 'seasoned':
      adjustments.push(-0.5)
      riskScore -= 5
      break
  }

  riskScore = Math.max(0, Math.min(100, riskScore))
  const totalAdjustment = adjustments.reduce((sum, a) => sum + a, 0)

  return {
    suggestedRateMin: round2(BASE_RATE_MIN + totalAdjustment),
    suggestedRateMax: round2(BASE_RATE_MAX + totalAdjustment),
    riskScore,
    riskFactors,
  }
}
