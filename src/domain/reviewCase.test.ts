import { describe, expect, test } from 'vitest'
import type { ExpenseCase } from '../types/review'
import { reviewCase } from './reviewCase'

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

describe('reviewCase', () => {
  test('執行一次分析後，案件的審查歷程新增一筆紀錄', () => {
    const expenseCase = buildCase()

    const reviewed = reviewCase(expenseCase, [])

    expect(reviewed.reviewHistory).toHaveLength(1)
  })

  test('重新執行分析時，先前的審查歷程紀錄不會被覆蓋', () => {
    const expenseCase = buildCase()

    const afterFirst = reviewCase(expenseCase, [])
    const afterSecond = reviewCase(afterFirst, [])

    expect(afterSecond.reviewHistory).toHaveLength(2)
    expect(afterSecond.reviewHistory[0]).toEqual(afterFirst.reviewHistory[0])
  })
})
