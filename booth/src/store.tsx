import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_POLICY, PRESET_CASES } from './data'
import type { ExpenseCase, Policy, Receipt } from './data'
import { gate, review, draftNotice } from './engine'
import type { Recommendation, Review } from './engine'

export type Status = '待處理' | '待補件' | '已完成初審' | '已轉交'
export type Actor = 'Agent' | '財務初審人員' | '系統'
export type Decision = { action: 'PROCEED' | 'REQUEST_INFO' | 'ESCALATE'; actor: Actor; time: string; note: string; message?: string; original: Recommendation }
export type LogEvent = { id: number; time: string; actor: Actor; action: string; caseId?: string; detail: string }
export type State = {
  cases: ExpenseCase[]; reviews: Record<string, Review[]>; decisions: Record<string, Decision>
  policy: Policy; log: LogEvent[]; seq: number; nextId: number; blocked: Record<string, string>
}
type Act =
  | { type: 'reset' }
  | { type: 'add'; item: Omit<ExpenseCase, 'id'> }
  | { type: 'decide'; id: string; decision: Omit<Decision, 'time' | 'original'> }
  | { type: 'agentRun' }
  | { type: 'policy'; policy: Policy }
  | { type: 'resubmit'; id: string; receipt?: Receipt; note: string }

const now = () => new Date().toLocaleTimeString('zh-TW', { hour12: false })
export const statusOf = (s: State, id: string): Status => {
  const d = s.decisions[id]
  if (!d) return '待處理'
  return d.action === 'PROCEED' ? '已完成初審' : d.action === 'REQUEST_INFO' ? '待補件' : '已轉交'
}
export const latest = (s: State, id: string) => s.reviews[id].at(-1)!
const ACTION_TEXT = { PROCEED: '送往下一審核節點', REQUEST_INFO: '通知申請人補件', ESCALATE: '轉交人工審核' }

function init(): State {
  const reviews: Record<string, Review[]> = {}
  for (const c of PRESET_CASES) reviews[c.id] = [{ ...review(c, PRESET_CASES, DEFAULT_POLICY), trigger: '初次審查', time: now() }]
  return { cases: PRESET_CASES, reviews, decisions: {}, blocked: {}, policy: DEFAULT_POLICY, nextId: 101, seq: 2,
    log: [{ id: 1, time: now(), actor: '系統', action: '載入待審案件', detail: `${PRESET_CASES.length} 筆案件完成初審分析（規範 v1）` }] }
}
function push(s: State, ev: Omit<LogEvent, 'id' | 'time'>): State {
  return { ...s, seq: s.seq + 1, log: [{ ...ev, id: s.seq, time: now() }, ...s.log] }
}

function reducer(s: State, a: Act): State {
  switch (a.type) {
    case 'reset': return init()
    case 'add': {
      const id = `EXP-2026-${s.nextId}`
      const item: ExpenseCase = { ...a.item, id, channel: '費用系統 API' }
      const cases = [item, ...s.cases]
      const r = { ...review(item, cases, s.policy), trigger: '初次審查', time: now() }
      let n: State = { ...s, cases, nextId: s.nextId + 1, reviews: { ...s.reviews, [id]: [r] } }
      n = push(n, { actor: '系統', action: '收到新申請', caseId: id, detail: `${item.applicant} 從費用系統送出・經 API 進件・模擬擷取憑證欄位` })
      return push(n, { actor: 'Agent', action: '完成初審分析', caseId: id, detail: `6 個面向・${r.recommendation}` })
    }
    case 'resubmit': {
      const old = s.cases.find(c => c.id === a.id)!
      const item: ExpenseCase = { ...old, receipt: a.receipt ?? old.receipt, applicantNote: a.note || old.applicantNote }
      const cases = s.cases.map(c => c.id === a.id ? item : c)
      const r = { ...review(item, cases, s.policy), trigger: '申請人補件', time: now() }
      const { [a.id]: _d, ...decisions } = s.decisions
      const { [a.id]: _b, ...blocked } = s.blocked
      let n: State = { ...s, cases, decisions, blocked, reviews: { ...s.reviews, [a.id]: [...s.reviews[a.id], r] } }
      n = push(n, { actor: '系統', action: '申請人補件', caseId: a.id, detail: [a.receipt && `補上憑證 ${a.receipt.id}`, a.note && `說明：${a.note}`].filter(Boolean).join('・') })
      n = push(n, { actor: 'Agent', action: '重新審查', caseId: a.id, detail: `${latest(s, a.id).recommendation} → ${r.recommendation}` })
      if (r.recommendation === '建議通過' && gate(item, r, s.policy).every(x => x.ok))
        n = reducer(n, { type: 'decide', id: a.id, decision: { action: 'PROCEED', actor: 'Agent', note: '補件後執行條件全部成立，已送往下一審核節點' } })
      return n
    }
    case 'decide': {
      const orig = latest(s, a.id).recommendation
      const decision: Decision = { ...a.decision, time: now(), original: orig }
      const n = { ...s, decisions: { ...s.decisions, [a.id]: decision } }
      const override = a.decision.actor !== 'Agent' && a.decision.action === 'PROCEED' && orig !== '建議通過'
      return push(n, { actor: a.decision.actor, action: override ? '人工確認通過（覆寫建議）' : ACTION_TEXT[a.decision.action], caseId: a.id, detail: a.decision.note || orig })
    }
    case 'agentRun': {
      let n = s
      for (const c of s.cases) {
        if (s.decisions[c.id] || s.blocked[c.id]) continue
        const r = latest(s, c.id)
        if (r.recommendation === '建議通過') {
          const g = gate(c, r, s.policy)
          const fail = g.filter(x => !x.ok)
          if (fail.length) {
            const note = `${fail.map(f => f.label).join('、')}不成立，Agent 未自動送出，已轉給你判斷`
            n = push({ ...n, blocked: { ...n.blocked, [c.id]: note } }, { actor: 'Agent', action: '攔截：未自動送出', caseId: c.id, detail: note })
          } else n = reducer(n, { type: 'decide', id: c.id, decision: { action: 'PROCEED', actor: 'Agent', note: '執行條件全部成立，已送往下一審核節點' } })
        } else if (r.recommendation === '建議補件' && s.policy.agentRequestInfo) {
          n = reducer(n, { type: 'decide', id: c.id, decision: { action: 'REQUEST_INFO', actor: 'Agent', note: '已寄出補件通知', message: draftNotice(c, r) } })
        }
      }
      return n
    }
    case 'policy': {
      const policy = { ...a.policy, version: s.policy.version + 1 }
      const reviews = { ...s.reviews }
      let changed = 0, count = 0
      for (const c of s.cases) {
        if (s.decisions[c.id]) continue
        const r = { ...review(c, s.cases, policy), trigger: `規範 v${policy.version} 生效`, time: now() }; count++
        if (r.recommendation !== latest(s, c.id).recommendation) changed++
        reviews[c.id] = [...reviews[c.id], r]
      }
      return push({ ...s, policy, reviews }, { actor: '財務初審人員', action: `更新企業規範 v${policy.version}`, detail: `重新審查 ${count} 筆待處理案件，${changed} 筆建議改變` })
    }
  }
}

type Ctx = { state: State; dispatch: (a: Act) => void }
const StoreCtx = createContext<Ctx>(null!)
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  return <StoreCtx.Provider value={{ state, dispatch }}>{children}</StoreCtx.Provider>
}
export const useStore = () => useContext(StoreCtx)
