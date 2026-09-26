import { describe, expect, test } from 'vitest'
import type { ExpenseCase } from '../types/review'
import { runReview } from './reviewEngine'

function buildCase(overrides: Partial<ExpenseCase> = {}): ExpenseCase {
  return {
    id: 'case-001',
    submittedBy: 'employee-001',
    category: '餐飲',
    claimedAmount: 1200,
    currency: 'TWD',
    expenseDate: '2026-09-01',
    submittedAt: '2026-09-02T09:00:00+08:00',
    description: '客戶餐敘',
    evidence: [
      {
        id: 'evidence-001',
        vendor: '好吃餐廳',
        amount: 1200,
        currency: 'TWD',
        date: '2026-09-01',
        fileName: 'receipt-001.jpg',
      },
    ],
    reviewHistory: [],
    ...overrides,
  }
}

describe('runReview', () => {
  test('資料完整、金額一致、無違規、無風險訊號時，建議通過且沒有發現項目', () => {
    const expenseCase = buildCase()

    const record = runReview(expenseCase, [])

    expect(record.recommendation).toBe('建議通過')
    expect(record.findings).toHaveLength(0)
  })

  test('每次分析都會回報三項必要檢核皆已完成', () => {
    const expenseCase = buildCase()

    const record = runReview(expenseCase, [])

    expect(record.requiredChecks).toEqual([
      { name: '佐證比對', completed: true },
      { name: '企業規範審查', completed: true },
      { name: '風險訊號檢查', completed: true },
    ])
  })

  test('缺少必要佐證資料時，建議補件，且發現項目標示為可補正缺漏', () => {
    const expenseCase = buildCase({ evidence: [] })

    const record = runReview(expenseCase, [])

    expect(record.recommendation).toBe('建議補件')
    expect(record.findings).toContainEqual(
      expect.objectContaining({
        source: 'EvidenceMatch',
        recommendationImpact: 'RequiresInfo',
      }),
    )
  })

  test('申請金額與佐證金額不一致時，建議人工審核', () => {
    const expenseCase = buildCase({
      claimedAmount: 1500,
      evidence: [
        {
          id: 'evidence-001',
          vendor: '好吃餐廳',
          amount: 1200,
          currency: 'TWD',
          date: '2026-09-01',
          fileName: 'receipt-001.jpg',
        },
      ],
    })

    const record = runReview(expenseCase, [])

    expect(record.recommendation).toBe('建議人工審核')
    expect(record.findings).toContainEqual(
      expect.objectContaining({
        source: 'EvidenceMatch',
        recommendationImpact: 'RequiresReview',
      }),
    )
  })

  test('申請金額超出該類別的企業規範金額上限時，建議人工審核', () => {
    const expenseCase = buildCase({
      category: '交通',
      claimedAmount: 5000,
      evidence: [
        {
          id: 'evidence-001',
          vendor: '計程車行',
          amount: 5000,
          currency: 'TWD',
          date: '2026-09-01',
          fileName: 'receipt-001.jpg',
        },
      ],
    })

    const record = runReview(expenseCase, [])

    expect(record.recommendation).toBe('建議人工審核')
    expect(record.findings).toContainEqual(
      expect.objectContaining({
        source: 'CorporatePolicy',
        recommendationImpact: 'RequiresReview',
      }),
    )
  })

  test('與既有案件供應商、金額、日期高度相近時，視為疑似重複申報並建議人工審核', () => {
    const existingCase = buildCase({ id: 'case-existing' })
    const newCase = buildCase({ id: 'case-new', expenseDate: '2026-09-02' })

    const record = runReview(newCase, [existingCase])

    expect(record.recommendation).toBe('建議人工審核')
    expect(record.findings).toContainEqual(
      expect.objectContaining({
        source: 'RiskSignal',
        recommendationImpact: 'RequiresReview',
      }),
    )
  })

  test('同時存在可補正缺漏與需人工審核的發現項目時，人工審核優先', () => {
    const expenseCase = buildCase({
      category: '交通',
      claimedAmount: 5000,
      evidence: [],
    })

    const record = runReview(expenseCase, [])

    expect(record.recommendation).toBe('建議人工審核')
    expect(record.findings).toContainEqual(expect.objectContaining({ recommendationImpact: 'RequiresInfo' }))
    expect(record.findings).toContainEqual(expect.objectContaining({ recommendationImpact: 'RequiresReview' }))
  })

  test('重複執行分析時，審查歷程需由呼叫端附加紀錄而非覆蓋，每次執行都會產生新的紀錄 id', () => {
    const expenseCase = buildCase()

    const first = runReview(expenseCase, [])
    const second = runReview(expenseCase, [])

    expect(first.id).not.toBe(second.id)
    expect(first.recommendation).toBe('建議通過')
    expect(second.recommendation).toBe('建議通過')
  })
})
