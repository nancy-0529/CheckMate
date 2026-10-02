import { describe, expect, it } from 'vitest'
import { DEFAULT_POLICY, PRESET_CASES } from './data'
import { gate, precheck, review } from './engine'

const byId = (id: string) => PRESET_CASES.find(c => c.id === id)!
const run = (id: string, policy = DEFAULT_POLICY) => review(byId(id), PRESET_CASES, policy)
const kindOf = (id: string, dim: string, policy = DEFAULT_POLICY) => run(id, policy).checks.find(c => c.dim === dim)!.kind

describe('六面向審查', () => {
  it('正常案件：6 項都有結果且建議通過', () => {
    const r = run('EXP-2026-001')
    expect(r.checks).toHaveLength(6)
    expect(r.recommendation).toBe('建議通過')
    expect(r.checks.every(c => c.kind === 'ok' || c.kind === 'na')).toBe(true)
  })
  it('缺少憑證：建議補件，不把缺憑證當成金額 0', () => {
    const r = run('EXP-2026-002')
    expect(kindOf('EXP-2026-002', 'amount')).toBe('missing')
    expect(r.recommendation).toBe('建議補件')
  })
  it('金額不一致：需確認並建議人工審核', () => {
    expect(kindOf('EXP-2026-003', 'amount')).toBe('issue')
    expect(run('EXP-2026-003').recommendation).toBe('建議人工審核')
  })
  it('超出住宿上限；調高上限後重新審查會改變建議', () => {
    expect(kindOf('EXP-2026-004', 'policy')).toBe('issue')
    const relaxed = { ...DEFAULT_POLICY, limits: { ...DEFAULT_POLICY.limits, 住宿費: 5000 } }
    expect(run('EXP-2026-004', relaxed).recommendation).toBe('建議通過')
  })
  it('疑似重複：可回溯到比對案件', () => {
    const c = run('EXP-2026-005').checks.find(c => c.dim === 'duplicate')!
    expect(c.kind).toBe('issue')
    expect(c.summary).toContain('EXP-2026-018')
  })
  it('費用類別沒有對應規範：無法判斷，不硬猜', () => {
    expect(kindOf('EXP-2026-007', 'policy')).toBe('unknown')
    expect(run('EXP-2026-007').recommendation).toBe('建議人工審核')
  })
  it('情境：出差地點與消費地點不符；停用規則則不適用', () => {
    expect(kindOf('EXP-2026-011', 'context')).toBe('issue')
    expect(kindOf('EXP-2026-011', 'context', { ...DEFAULT_POLICY, context: false })).toBe('na')
  })
  it('真偽風險訊號', () => {
    expect(kindOf('EXP-2026-012', 'authenticity')).toBe('issue')
  })
  it('憑證金額無法辨識：無法判斷', () => {
    const c = { ...byId('EXP-2026-001'), id: 'X', receipt: { ...byId('EXP-2026-001').receipt!, amount: undefined } }
    const r = review(c, PRESET_CASES, DEFAULT_POLICY)
    expect(r.checks[0].kind).toBe('unknown')
    expect(r.recommendation).toBe('建議人工審核')
  })
})

describe('Agent 執行條件', () => {
  it('建議通過且在授權範圍內：六項條件成立', () => {
    const g = gate(byId('EXP-2026-001'), run('EXP-2026-001'), DEFAULT_POLICY)
    expect(g.every(c => c.ok)).toBe(true)
  })
  it('建議通過但超出授權金額：只有授權範圍不成立', () => {
    const g = gate(byId('EXP-2026-015'), run('EXP-2026-015'), DEFAULT_POLICY)
    expect(run('EXP-2026-015').recommendation).toBe('建議通過')
    expect(g.filter(c => !c.ok).map(c => c.key)).toEqual(['authority'])
  })
  it('有阻擋風險時不能執行', () => {
    const g = gate(byId('EXP-2026-004'), run('EXP-2026-004'), DEFAULT_POLICY)
    expect(g.find(c => c.key === 'risk')!.ok).toBe(false)
  })
})

describe('疑似拆單', () => {
  it('同日同商家多筆、各自未超額但合計超過上限', () => {
    const c = run('EXP-2026-013').checks.find(c => c.dim === 'duplicate')!
    expect(c.kind).toBe('issue')
    expect(c.summary).toContain('拆單')
    expect(c.summary).toContain('EXP-2026-014')
    expect(run('EXP-2026-013').recommendation).toBe('建議人工審核')
  })
  it('單獨一筆不構成拆單', () => {
    expect(kindOf('EXP-2026-012', 'duplicate')).toBe('ok')
  })
})

describe('送出前提醒', () => {
  const form = { applicant: '謝宛庭', dept: '業務部', category: '住宿費', title: 't', amount: 3600, date: '2026-09-25', purpose: 'p', tripCity: '台中' }
  const rc = { id: 'EV-1', vendor: 'v', title: 't', date: '2026-09-25', city: '台中', amount: 3600, taxId: true, lines: [] }
  it('未附憑證會提醒', () => {
    expect(precheck(form, undefined, DEFAULT_POLICY).map(h => h.key)).toContain('noReceipt')
  })
  it('超過上限會提醒但不阻擋', () => {
    const hs = precheck(form, rc, DEFAULT_POLICY)
    expect(hs.find(h => h.key === 'overLimit')).toBeTruthy()
    expect(hs.every(h => h.level !== 'block')).toBe(true)
  })
  it('申請金額與憑證不同會提醒', () => {
    expect(precheck({ ...form, amount: 3000 }, rc, DEFAULT_POLICY).map(h => h.key)).toContain('mismatch')
  })
  it('資料齊全且未超額：沒有提醒', () => {
    expect(precheck({ ...form, amount: 2400 }, { ...rc, amount: 2400 }, DEFAULT_POLICY)).toEqual([])
  })
})
