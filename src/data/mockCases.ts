import { reviewCase } from '../domain/reviewCase'
import type { ExpenseCase } from '../types/review'

type RawCase = Omit<ExpenseCase, 'reviewHistory'>

const rawCases: RawCase[] = [
  {
    id: 'case-001',
    submittedBy: '王小明',
    category: '餐飲',
    claimedAmount: 1200,
    currency: 'TWD',
    expenseDate: '2026-09-01',
    submittedAt: '2026-09-02T09:00:00+08:00',
    description: '客戶餐敘',
    evidence: [
      {
        id: 'case-001-evidence-001',
        vendor: '好吃餐廳',
        amount: 1200,
        currency: 'TWD',
        date: '2026-09-01',
        fileName: 'receipt-case-001.jpg',
      },
    ],
  },
  {
    id: 'case-002',
    submittedBy: '李小華',
    category: '住宿',
    claimedAmount: 4200,
    currency: 'TWD',
    expenseDate: '2026-09-03',
    submittedAt: '2026-09-04T09:00:00+08:00',
    description: '出差住宿',
    evidence: [],
  },
  {
    id: 'case-003',
    submittedBy: '陳小芳',
    category: '交通',
    claimedAmount: 1800,
    currency: 'TWD',
    expenseDate: '2026-09-05',
    submittedAt: '2026-09-06T09:00:00+08:00',
    description: '客戶拜訪計程車資',
    evidence: [
      {
        id: 'case-003-evidence-001',
        vendor: '大都會計程車',
        amount: 1500,
        currency: 'TWD',
        date: '2026-09-05',
        fileName: 'receipt-case-003.jpg',
      },
    ],
  },
  {
    id: 'case-004',
    submittedBy: '林小強',
    category: '餐飲',
    claimedAmount: 2600,
    currency: 'TWD',
    expenseDate: '2026-09-07',
    submittedAt: '2026-09-08T09:00:00+08:00',
    description: '團隊聚餐',
    evidence: [
      {
        id: 'case-004-evidence-001',
        vendor: '囍宴餐廳',
        amount: 2600,
        currency: 'TWD',
        date: '2026-09-07',
        fileName: 'receipt-case-004.jpg',
      },
    ],
  },
  {
    id: 'case-005',
    submittedBy: '王小明',
    category: '餐飲',
    claimedAmount: 1200,
    currency: 'TWD',
    expenseDate: '2026-09-02',
    submittedAt: '2026-09-03T09:00:00+08:00',
    description: '客戶餐敘（疑似重複申報）',
    evidence: [
      {
        id: 'case-005-evidence-001',
        vendor: '好吃餐廳',
        amount: 1200,
        currency: 'TWD',
        date: '2026-09-02',
        fileName: 'receipt-case-005.jpg',
      },
    ],
  },
]

export function buildMockCases(): ExpenseCase[] {
  const reviewedCases: ExpenseCase[] = []

  for (const rawCase of rawCases) {
    const priorCases = [...reviewedCases]
    const caseWithHistory: ExpenseCase = { ...rawCase, reviewHistory: [] }
    reviewedCases.push(reviewCase(caseWithHistory, priorCases))
  }

  return reviewedCases
}
