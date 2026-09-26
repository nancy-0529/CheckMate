import type { FindingSeverity, RecommendationType } from '../../types/review'

export const RECOMMENDATION_LABEL: Record<RecommendationType, string> = {
  建議通過: '建議通過',
  建議補件: '建議補件',
  建議人工審核: '建議人工審核',
}

export const RECOMMENDATION_TONE: Record<RecommendationType, 'positive' | 'caution' | 'critical'> = {
  建議通過: 'positive',
  建議補件: 'caution',
  建議人工審核: 'critical',
}

export const SEVERITY_LABEL: Record<FindingSeverity, string> = {
  Blocking: '阻擋',
  NeedsAttention: '需留意',
  Informational: '僅供參考',
}

export const SEVERITY_TONE: Record<FindingSeverity, 'positive' | 'caution' | 'critical' | 'neutral'> = {
  Blocking: 'critical',
  NeedsAttention: 'caution',
  Informational: 'neutral',
}

export const FINDING_SOURCE_LABEL: Record<string, string> = {
  EvidenceMatch: '佐證比對',
  CorporatePolicy: '企業規範審查',
  RiskSignal: '風險訊號',
}
