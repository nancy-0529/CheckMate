export type Currency = 'TWD'

export type ExpenseCategory = '交通' | '住宿' | '餐飲' | '其他'

export interface EvidenceRecord {
  id: string
  vendor: string
  amount: number
  currency: Currency
  date: string
  fileName?: string
}

export interface ExpenseCase {
  id: string
  submittedBy: string
  category: ExpenseCategory
  claimedAmount: number
  currency: Currency
  expenseDate: string
  submittedAt: string
  description: string
  evidence: EvidenceRecord[]
  reviewHistory: ReviewRecord[]
}

export type FindingSource = 'EvidenceMatch' | 'CorporatePolicy' | 'RiskSignal'
export type FindingSeverity = 'Blocking' | 'NeedsAttention' | 'Informational'
export type RecommendationImpact = 'RequiresReview' | 'RequiresInfo' | 'None'

export interface Finding {
  id: string
  source: FindingSource
  severity: FindingSeverity
  recommendationImpact: RecommendationImpact
  title: string
  description: string
  ruleReference?: string
}

export type RecommendationType = '建議通過' | '建議補件' | '建議人工審核'

export interface RequiredCheckResult {
  name: string
  completed: boolean
}

export interface ReviewRecord {
  id: string
  caseId: string
  performedAt: string
  actor: 'Agent'
  requiredChecks: RequiredCheckResult[]
  findings: Finding[]
  recommendation: RecommendationType
}
