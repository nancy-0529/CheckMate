import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { reviewCase } from '../../domain/reviewCase'
import { buildMockCases } from '../../data/mockCases'
import type { ExpenseCase } from '../../types/review'

interface CaseReviewContextValue {
  cases: ExpenseCase[]
  getCase: (caseId: string) => ExpenseCase | undefined
  rerunAnalysis: (caseId: string) => void
}

const CaseReviewContext = createContext<CaseReviewContextValue | null>(null)

export function CaseReviewProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<ExpenseCase[]>(() => buildMockCases())

  const value = useMemo<CaseReviewContextValue>(
    () => ({
      cases,
      getCase: (caseId) => cases.find((c) => c.id === caseId),
      rerunAnalysis: (caseId) => {
        setCases((prev) => {
          const target = prev.find((c) => c.id === caseId)
          if (!target) return prev
          const reviewed = reviewCase(target, prev)
          return prev.map((c) => (c.id === caseId ? reviewed : c))
        })
      },
    }),
    [cases],
  )

  return <CaseReviewContext.Provider value={value}>{children}</CaseReviewContext.Provider>
}

export function useCaseReview(): CaseReviewContextValue {
  const context = useContext(CaseReviewContext)
  if (!context) {
    throw new Error('useCaseReview 必須在 CaseReviewProvider 內使用')
  }
  return context
}
