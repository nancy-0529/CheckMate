import { describe, expect, test } from 'vitest'
import { buildMockCases } from './mockCases'

describe('buildMockCases', () => {
  test('產出 5 筆代表性案件，涵蓋正常、缺件、金額不一致、超限、疑似重複', () => {
    const cases = buildMockCases()

    expect(cases).toHaveLength(5)
    const recommendations = cases.map((c) => c.reviewHistory[0]?.recommendation)
    expect(recommendations).toEqual(['建議通過', '建議補件', '建議人工審核', '建議人工審核', '建議人工審核'])
  })

  test('正常案件（第一筆）不會被後面才提交的疑似重複案件影響判斷', () => {
    const cases = buildMockCases()
    const normalCase = cases[0]

    const hasRiskSignal = normalCase.reviewHistory[0].findings.some((f) => f.source === 'RiskSignal')

    expect(hasRiskSignal).toBe(false)
  })

  test('疑似重複申報案件（第五筆）能比對到先前已存在的案件', () => {
    const cases = buildMockCases()
    const duplicateSuspectCase = cases[4]

    const hasRiskSignal = duplicateSuspectCase.reviewHistory[0].findings.some((f) => f.source === 'RiskSignal')

    expect(hasRiskSignal).toBe(true)
  })
})
