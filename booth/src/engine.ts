import { HISTORY, LIMIT_UNIT, RULE_IDS, money } from './data'
import type { ExpenseCase, Policy, Receipt } from './data'

export type Recommendation = '建議通過' | '建議補件' | '建議人工審核'
export type DimKey = 'amount' | 'policy' | 'format' | 'duplicate' | 'context' | 'authenticity'
export type CheckKind = 'ok' | 'issue' | 'missing' | 'unknown' | 'na' | 'wait'
export type Check = { dim: DimKey; kind: CheckKind; summary: string; basis: string; rule: string }
export type Review = { checks: Check[]; recommendation: Recommendation; policyVersion: number; trigger?: string; time?: string }

export const DIMS: { key: DimKey; label: string; group: '規則' | '情境' | '真偽' }[] = [
  { key: 'amount', label: '申請與憑證核對', group: '規則' },
  { key: 'policy', label: '企業規範', group: '規則' },
  { key: 'format', label: '憑證格式（法規）', group: '規則' },
  { key: 'duplicate', label: '重複／拆單比對', group: '規則' },
  { key: 'context', label: '情境合理性', group: '情境' },
  { key: 'authenticity', label: '憑證真偽風險', group: '真偽' },
]
export const KIND_LABEL: Record<CheckKind, string> = { ok: '未見異常', issue: '需確認', missing: '缺件', unknown: '無法判斷', na: '不適用', wait: '補件後檢查' }

export function review(item: ExpenseCase, all: ExpenseCase[], p: Policy): Review {
  const rc = item.receipt
  const checks: Check[] = []
  const add = (dim: DimKey, kind: CheckKind, summary: string, basis: string, rule: string) => checks.push({ dim, kind, summary, basis, rule })

  if (!rc) add('amount', 'missing', `缺少${item.category}憑證，無法核對金額`, `申請 ${money(item.amount)}・目前附件 0 份`, 'P-02｜費用須檢附對應憑證。')
  else if (rc.amount === undefined) add('amount', 'unknown', '憑證金額無法辨識，不能可靠比對', `申請 ${money(item.amount)}・憑證金額欄位模糊`, 'E-01｜申請金額須與憑證金額一致；無法辨識時不推定。')
  else if (rc.amount !== item.amount) add('amount', 'issue', `申請比憑證${rc.amount < item.amount ? '多' : '少'} ${money(Math.abs(item.amount - rc.amount))}`, `申請 ${money(item.amount)}・憑證 ${money(rc.amount)}`, 'E-01｜申請金額須與憑證金額一致，不設容許誤差。')
  else add('amount', 'ok', `申請 ${money(item.amount)} ＝ 憑證 ${money(rc.amount)}`, `憑證 ${rc.id}・${rc.vendor}`, 'E-01｜申請金額須與憑證金額一致，不設容許誤差。')

  const limit = p.limits[item.category]
  const rid = RULE_IDS[item.category]
  if (limit === undefined) add('policy', 'unknown', '此費用類別尚無對應規範，需人工確認', `申請類別：${item.category}`, '目前企業規範僅涵蓋：' + Object.keys(p.limits).join('、') + '。')
  else if (item.amount > limit) add('policy', 'issue', `超出${LIMIT_UNIT[item.category]}上限 ${money(item.amount - limit)}`, `本次 ${money(item.amount)}・上限 ${money(limit)}`, `${rid}｜${item.category}${LIMIT_UNIT[item.category]}以 ${money(limit)} 為上限。`)
  else add('policy', 'ok', `未超過${LIMIT_UNIT[item.category]}上限 ${money(limit)}`, `本次 ${money(item.amount)}・上限 ${money(limit)}`, `${rid}｜${item.category}${LIMIT_UNIT[item.category]}以 ${money(limit)} 為上限。`)

  const fmtRule = `C-01｜金額達 ${money(p.taxIdThreshold)} 時，憑證須有統一編號（示範規則）。`
  if (!rc) add('format', 'wait', '尚無憑證，補件後檢查', '—', fmtRule)
  else if (item.amount < p.taxIdThreshold) add('format', 'na', `未達 ${money(p.taxIdThreshold)} 門檻，不適用`, `申請 ${money(item.amount)}`, fmtRule)
  else if (!rc.taxId) add('format', 'issue', '憑證缺少統一編號', `申請 ${money(item.amount)}・門檻 ${money(p.taxIdThreshold)}`, fmtRule)
  else add('format', 'ok', '統一編號欄位完整', `憑證 ${rc.id}`, fmtRule)

  const dupRule = 'R-01｜比對申請人、商家、金額與日期，標示相同的既有案件；R-02｜同日同商家多筆合計超過上限，標示疑似拆單。'
  if (!p.duplicate) add('duplicate', 'na', '此規則未啟用', '—', dupRule)
  else {
    const vendor = rc?.vendor
    const same = (o: { applicant: string; date: string }) => o.applicant === item.applicant && o.date === item.date
    const hit = HISTORY.find(h => same(h) && h.amount === item.amount && h.vendor === vendor)
      ?? all.find(o => o.id !== item.id && same(o) && o.amount === item.amount && o.receipt?.vendor === vendor)
    const siblings = vendor ? all.filter(o => o.id !== item.id && same(o) && o.receipt?.vendor === vendor) : []
    const total = item.amount + siblings.reduce((sum, o) => sum + o.amount, 0)
    if (hit) add('duplicate', 'issue', `與 ${hit.id} 疑似重複`, '申請人、商家、金額、日期皆相同；不代表已認定重複', dupRule)
    else if (siblings.length && limit !== undefined && item.amount <= limit && total > limit)
      add('duplicate', 'issue', `疑似拆單：與 ${siblings.map(o => o.id).join('、')} 同日同商家`, `${siblings.length + 1} 筆合計 ${money(total)}，超過單筆上限 ${money(limit)}；不代表已認定拆單`, dupRule)
    else add('duplicate', 'ok', '比對既有案件，未發現重複或拆單', `比對 ${HISTORY.length + all.length - 1} 筆案件`, dupRule)
  }

  const ctxRule = 'X-01｜比對出差行程與憑證消費地點（示範情境規則）。'
  if (!p.context) add('context', 'na', '此規則未啟用', '—', ctxRule)
  else if (!item.tripCity) add('context', 'na', '非出差費用，不適用', '—', ctxRule)
  else if (!rc?.city) add('context', 'wait', '尚無憑證，補件後檢查', `出差行程：${item.tripCity}`, ctxRule)
  else if (rc.city !== item.tripCity) add('context', 'issue', `出差在${item.tripCity}，消費地點在${rc.city}`, `同一天，不同城市・系統不判定違規`, ctxRule)
  else add('context', 'ok', '出差行程與消費地點相符', `行程 ${item.tripCity}・憑證 ${rc.city}`, ctxRule)

  const auRule = 'A-01｜比對憑證版型與同商家歷史憑證（模擬訊號）。'
  if (!p.authenticity) add('authenticity', 'na', '此規則未啟用', '—', auRule)
  else if (!rc) add('authenticity', 'wait', '尚無憑證，補件後檢查', '—', auRule)
  else if (rc.layoutMismatch) add('authenticity', 'issue', '版型與同商家歷史憑證不一致', '僅為風險訊號，不做偽造認定', auRule)
  else add('authenticity', 'ok', '版型與同商家憑證一致', `商家 ${rc.vendor}`, auRule)

  const recommendation: Recommendation = checks.some(c => c.kind === 'issue' || c.kind === 'unknown') ? '建議人工審核'
    : checks.some(c => c.kind === 'missing') ? '建議補件' : '建議通過'
  return { checks, recommendation, policyVersion: p.version }
}

export type GateItem = { key: 'checks' | 'evidence' | 'clear' | 'risk' | 'conflict' | 'authority'; label: string; ok: boolean; note: string }
export function gate(item: ExpenseCase, r: Review, p: Policy): GateItem[] {
  const k = (d: DimKey) => r.checks.find(c => c.dim === d)!.kind
  const riskDims: DimKey[] = ['policy', 'format', 'context', 'authenticity']
  const conflictDims: DimKey[] = ['amount', 'duplicate']
  const inAuthority = p.agentProceed && item.amount <= p.agentLimit
  return [
    { key: 'checks', label: '必要檢查完成', ok: r.checks.every(c => c.kind !== 'wait' && c.kind !== 'missing'), note: '6 個面向都有結果' },
    { key: 'evidence', label: '證據充分', ok: !!item.receipt && item.receipt.amount !== undefined, note: '憑證齊全且可辨識' },
    { key: 'clear', label: '規則明確', ok: r.checks.every(c => c.kind !== 'unknown'), note: '沒有無法判斷的項目' },
    { key: 'risk', label: '無阻擋風險', ok: riskDims.every(d => k(d) !== 'issue'), note: '規範、格式、情境、真偽' },
    { key: 'conflict', label: '無未解決衝突', ok: conflictDims.every(d => k(d) !== 'issue'), note: '金額與重複比對' },
    { key: 'authority', label: '位於企業授權範圍', ok: inAuthority, note: p.agentProceed ? `Agent 可處理 ${money(p.agentLimit)} 以內` : 'Agent 送出權限未開啟' },
  ]
}

export function draftNotice(item: ExpenseCase, r: Review): string {
  const lines = r.checks.filter(c => c.kind === 'missing' || c.kind === 'issue' || c.kind === 'unknown').map(c => {
    if (c.kind === 'missing') return `・缺少${item.category}憑證，請補上傳收據或發票。`
    if (c.dim === 'amount') return `・${c.summary}，請補充差額說明或正確憑證。`
    if (c.dim === 'duplicate') return `・${c.summary}，請說明兩筆是否為不同支出。`
    if (c.dim === 'context') return `・${c.summary}，請說明行程異動或消費原因。`
    if (c.dim === 'policy' && c.kind === 'issue') return `・${c.summary}，如有主管核准的例外，請附上核准紀錄。`
    return `・${c.summary}，請補充相關說明。`
  })
  const rules = [...new Set(r.checks.filter(c => c.kind !== 'ok' && c.kind !== 'na' && c.kind !== 'wait').map(c => c.rule.split('｜')[0]))]
  return `${item.applicant}您好：\n\n您申請的 ${item.id}「${item.title}」需要補充以下資料：\n${lines.join('\n')}\n\n補齊後請重新送出，系統會再次審查。${rules.length ? `\n依據：${rules.join('、')}` : ''}`
}

export type Hint = { key: 'noReceipt' | 'unreadable' | 'mismatch' | 'overLimit' | 'taxId' | 'noPolicy'; level: 'warn' | 'info' | 'block'; text: string }
type Form = Pick<ExpenseCase, 'category' | 'amount'>
export function precheck(form: Form, rc: Receipt | undefined, p: Policy): Hint[] {
  const hs: Hint[] = []
  const limit = p.limits[form.category]
  if (!rc) hs.push({ key: 'noReceipt', level: 'warn', text: `尚未附上${form.category}憑證。沒有憑證，送出後會被退回補件。` })
  else if (rc.amount === undefined) hs.push({ key: 'unreadable', level: 'warn', text: '憑證金額看不清楚，建議重新拍攝，避免被退回或延誤。' })
  else if (rc.amount !== form.amount) hs.push({ key: 'mismatch', level: 'warn', text: `申請金額 ${money(form.amount)} 與憑證 ${money(rc.amount)} 不同，請確認是否填錯。` })
  if (limit === undefined) hs.push({ key: 'noPolicy', level: 'info', text: '此費用類別尚無對應規範，送出後會由財務人工確認。' })
  else if (form.amount > limit) hs.push({ key: 'overLimit', level: 'info', text: `超過${LIMIT_UNIT[form.category]}上限 ${money(limit)}。仍可送出，會由財務人工審核；如有主管核准，請在說明中註明。` })
  if (rc && form.amount >= p.taxIdThreshold && !rc.taxId) hs.push({ key: 'taxId', level: 'warn', text: `金額達 ${money(p.taxIdThreshold)}，憑證需要統一編號。` })
  return hs
}
