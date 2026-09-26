import type { ExpenseCase } from '../types/review'
import { runReview } from './reviewEngine'

export function reviewCase(expenseCase: ExpenseCase, existingCases: ExpenseCase[]): ExpenseCase {
  const record = runReview(expenseCase, existingCases)

  return {
    ...expenseCase,
    reviewHistory: [...expenseCase.reviewHistory, record],
  }
}
