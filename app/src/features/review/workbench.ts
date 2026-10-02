import type { ExpenseCase, Recommendation } from '../../data/cases'

export type Decision = {
  status: '初審完成' | '待補件'
  actor: string
  reason: string
  time: string
  originalRecommendation: Recommendation
}
export function filterCases(items: ExpenseCase[], id: string, applicant: string, recommendations: Recommendation[]) {
  return items.filter(item => item.id.toLowerCase().includes(id.trim().toLowerCase()) && item.applicant.includes(applicant.trim()) && (!recommendations.length || recommendations.includes(item.reviews.at(-1)!.recommendation)))
}
export function recordDecision(item: ExpenseCase, existing: Decision | undefined, action: 'PROCEED' | 'REQUEST_INFO', reason: string, reviewId: string, time = new Date().toISOString()): Decision {
  const latest = item.reviews.at(-1)!
  if (existing) throw new Error('此案件已完成處理。')
  if (latest.id !== reviewId) throw new Error('請回到最新初審紀錄後再處理。')
  if ((action === 'REQUEST_INFO' || latest.recommendation !== '建議通過') && !reason.trim()) throw new Error('請填寫補件內容或審核說明。')
  return { status: action === 'PROCEED' ? '初審完成' : '待補件', actor: '財務初審人員', reason: reason.trim(), time, originalRecommendation: latest.recommendation }
}

export function completeBatch(items: ExpenseCase[], decisions: Record<string, Decision>): Record<string, Decision> {
  if (!items.length || new Set(items.map(c => c.id)).size !== items.length) throw new Error('請選取尚未處理的案件。')
  if (items.some(c => c.reviews.at(-1)!.recommendation !== '建議通過' || decisions[c.id])) throw new Error('僅能批次完成尚未處理的建議通過案件。')
  const time = new Date().toISOString()
  return Object.fromEntries(items.map(c => [c.id, recordDecision(c, undefined, 'PROCEED', '', c.reviews.at(-1)!.id, time)]))
}

export const progressViews = ['待處理', '待補件', '已完成初審', '全部'] as const
export type ProgressView = typeof progressViews[number]
export function filterByProgress(items: ExpenseCase[], decisions: Record<string, Decision>, view: ProgressView) {
  return items.filter(c => view === '全部' || (view === '待處理' ? !decisions[c.id] : decisions[c.id]?.status === (view === '已完成初審' ? '初審完成' : '待補件')))
}
