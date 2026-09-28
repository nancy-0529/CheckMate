import { describe, expect, it } from 'vitest'
import { cases } from '../../data/cases'
import { filterByProgress, completeBatch, filterCases, recordDecision } from './workbench'

describe('案件工作台', () => {
  it('編號與姓名使用 AND，複選建議使用 OR，且忽略搜尋前後空白', () => {
    expect(filterCases(cases, ' 002 ', ' 林 ', ['建議補件', '建議通過']).map(c => c.id)).toEqual(['EXP-2026-002'])
    expect(filterCases(cases, '002', '王', [])).toEqual([])
    expect(filterCases(cases, '', '', ['建議補件', '建議通過'])).toHaveLength(3)
  })
  it('空篩選顯示所有案件', () => {
    expect(filterCases(cases, '', '', [])).toHaveLength(cases.length)
  })
  it('人工處理不改寫原始建議，且紀錄含執行者、原因、時間', () => {
    const result = recordDecision(cases[2], undefined, 'PROCEED', '已核對額外交通費證明', 'REV-003-1', '2026-09-28T00:00:00Z')
    expect(result.status).toBe('初審完成')
    expect(result.actor).toBe('財務初審人員')
    expect(result.reason).toBe('已核對額外交通費證明')
    expect(result.time).toBe('2026-09-28T00:00:00Z')
    expect(result.originalRecommendation).toBe('建議人工審核')
    expect(cases[2].reviews[0].recommendation).toBe('建議人工審核')
  })
  it('人工通過例外案件必須填寫原因，補件必須有補件內容', () => {
    expect(() => recordDecision(cases[2], undefined, 'PROCEED', ' ', 'REV-003-1')).toThrow()
    expect(() => recordDecision(cases[1], undefined, 'REQUEST_INFO', '', 'REV-002-1')).toThrow()
    expect(recordDecision(cases[1], undefined, 'REQUEST_INFO', '請補住宿憑證', 'REV-002-1').status).toBe('待補件')
  })
  it('歷史紀錄不能執行處置；重複送出不產生第二筆處置', () => {
    expect(() => recordDecision(cases[0], undefined, 'PROCEED', '', 'REV-001-1')).toThrow()
    const result = recordDecision(cases[0], undefined, 'PROCEED', '', 'REV-001-2')
    expect(() => recordDecision(cases[0], result, 'PROCEED', '', 'REV-001-2')).toThrow()
  })
})

describe('批次完成初審', () => {
  it('只接受未處理且建議通過的案件，保留每筆原始建議', () => {
    const passing = cases.filter(c => c.reviews.at(-1)!.recommendation === '建議通過')
    const results = completeBatch(passing, {})
    expect(Object.keys(results)).toHaveLength(passing.length)
    expect(Object.values(results).every(d => d.status === '初審完成' && d.originalRecommendation === '建議通過')).toBe(true)
  })
  it('混入例外、已處理或重複案件時整批不執行', () => {
    expect(() => completeBatch([cases[0], cases[1]], {})).toThrow()
    const done = recordDecision(cases[0], undefined, 'PROCEED', '', 'REV-001-2')
    expect(() => completeBatch([cases[0]], { [cases[0].id]: done })).toThrow()
    expect(() => completeBatch([cases[0], cases[0]], {})).toThrow()
    expect(() => completeBatch([], {})).toThrow()
  })
  it('缺件案件人工通過必須提供依據', () => {
    expect(() => recordDecision(cases[1], undefined, 'PROCEED', '', 'REV-002-1')).toThrow()
    expect(recordDecision(cases[1], undefined, 'PROCEED', '已核對其他附件中的住宿憑證', 'REV-002-1').originalRecommendation).toBe('建議補件')
  })
})

describe('依處理進度分流', () => {
  it('完成及退回案件移出待處理，等待補件不算已完成', () => {
    const decisions = {
      [cases[0].id]: recordDecision(cases[0], undefined, 'PROCEED', '', 'REV-001-2'),
      [cases[1].id]: recordDecision(cases[1], undefined, 'REQUEST_INFO', '請補憑證', 'REV-002-1'),
    }
    expect(filterByProgress(cases, decisions, '待處理')).toHaveLength(cases.length - 2)
    expect(filterByProgress(cases, decisions, '待補件').map(c => c.id)).toEqual([cases[1].id])
    expect(filterByProgress(cases, decisions, '已完成初審').map(c => c.id)).toEqual([cases[0].id])
    expect(filterByProgress(cases, decisions, '全部')).toHaveLength(cases.length)
    expect(filterCases(filterByProgress(cases, decisions, '待補件'), '', '林', ['建議補件'])).toHaveLength(1)
  })
})
