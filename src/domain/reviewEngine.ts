import type { ExpenseCase, ExpenseCategory, Finding, ReviewRecord } from '../types/review'

const CATEGORY_AMOUNT_CAP: Record<ExpenseCategory, number> = {
  交通: 3000,
  住宿: 5000,
  餐飲: 2000,
  其他: 1500,
}

let sequence = 0
function nextId(prefix: string): string {
  sequence += 1
  return `${prefix}-${sequence}`
}

function checkEvidenceMatching(expenseCase: ExpenseCase): Finding[] {
  const findings: Finding[] = []

  if (expenseCase.evidence.length === 0) {
    findings.push({
      id: nextId('finding'),
      source: 'EvidenceMatch',
      severity: 'Blocking',
      recommendationImpact: 'RequiresInfo',
      title: '缺少必要佐證資料',
      description: '此案件未附上任何佐證資料，無法完成金額比對。',
    })
    return findings
  }

  const evidenceTotal = expenseCase.evidence.reduce((sum, item) => sum + item.amount, 0)
  if (evidenceTotal !== expenseCase.claimedAmount) {
    findings.push({
      id: nextId('finding'),
      source: 'EvidenceMatch',
      severity: 'Blocking',
      recommendationImpact: 'RequiresReview',
      title: '申請金額與佐證金額不一致',
      description: `申請金額 ${expenseCase.claimedAmount} 與佐證金額合計 ${evidenceTotal} 不符。`,
    })
  }

  return findings
}

function checkCorporatePolicy(expenseCase: ExpenseCase): Finding[] {
  const findings: Finding[] = []
  const cap = CATEGORY_AMOUNT_CAP[expenseCase.category]

  if (expenseCase.claimedAmount > cap) {
    findings.push({
      id: nextId('finding'),
      source: 'CorporatePolicy',
      severity: 'Blocking',
      recommendationImpact: 'RequiresReview',
      title: '申請金額超出類別上限',
      description: `「${expenseCase.category}」類別金額上限為 ${cap}，此案件申請 ${expenseCase.claimedAmount}。`,
      ruleReference: `企業規範：${expenseCase.category}類別金額上限`,
    })
  }

  return findings
}

const DUPLICATE_SUSPECT_WINDOW_DAYS = 3

function daysBetween(dateA: string, dateB: string): number {
  const diffMs = Math.abs(new Date(dateA).getTime() - new Date(dateB).getTime())
  return diffMs / (1000 * 60 * 60 * 24)
}

function checkRiskSignals(expenseCase: ExpenseCase, existingCases: ExpenseCase[]): Finding[] {
  const findings: Finding[] = []
  const primaryVendor = expenseCase.evidence[0]?.vendor

  const suspectedDuplicate = existingCases.some(
    (other) =>
      other.id !== expenseCase.id &&
      other.submittedBy === expenseCase.submittedBy &&
      other.claimedAmount === expenseCase.claimedAmount &&
      other.evidence[0]?.vendor === primaryVendor &&
      daysBetween(other.expenseDate, expenseCase.expenseDate) <= DUPLICATE_SUSPECT_WINDOW_DAYS,
  )

  if (suspectedDuplicate) {
    findings.push({
      id: nextId('finding'),
      source: 'RiskSignal',
      severity: 'Blocking',
      recommendationImpact: 'RequiresReview',
      title: '疑似重複申報',
      description: '此案件與既有案件的申請人、供應商、金額相同，且申請日期相近。',
    })
  }

  return findings
}

function deriveRecommendation(findings: Finding[]) {
  if (findings.some((finding) => finding.recommendationImpact === 'RequiresReview')) {
    return '建議人工審核' as const
  }
  if (findings.some((finding) => finding.recommendationImpact === 'RequiresInfo')) {
    return '建議補件' as const
  }
  return '建議通過' as const
}

export function runReview(expenseCase: ExpenseCase, existingCases: ExpenseCase[]): ReviewRecord {
  const findings: Finding[] = [
    ...checkEvidenceMatching(expenseCase),
    ...checkCorporatePolicy(expenseCase),
    ...checkRiskSignals(expenseCase, existingCases),
  ]

  return {
    id: nextId('review'),
    caseId: expenseCase.id,
    performedAt: new Date().toISOString(),
    actor: 'Agent',
    requiredChecks: [
      { name: '佐證比對', completed: true },
      { name: '企業規範審查', completed: true },
      { name: '風險訊號檢查', completed: true },
    ],
    findings,
    recommendation: deriveRecommendation(findings),
  }
}
