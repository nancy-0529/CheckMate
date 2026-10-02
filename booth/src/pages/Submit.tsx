import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, Camera, Check, Info, Inbox, Loader2, Send, Sparkles } from 'lucide-react'
import { SAMPLES, SUPPLEMENTS, money } from '../data'
import type { ExpenseCase, Receipt } from '../data'
import { DIMS, KIND_LABEL, precheck } from '../engine'
import { latest, statusOf, useStore } from '../store'
import { Badge, ReceiptView } from '../components/ui'
import type { Highlight } from '../components/ui'

const STAGES = ['經 API 收件', '讀取憑證', '擷取欄位', '6 面向審查', '產生建議']
const FIELDS: { k: Highlight; label: string }[] = [{ k: 'vendor', label: '商家' }, { k: 'date', label: '消費日期' }, { k: 'city', label: '消費地點' }, { k: 'amount', label: '合計金額' }, { k: 'taxId', label: '統一編號' }]
type Job = { kind: 'new'; item: Omit<ExpenseCase, 'id'>; id: string } | { kind: 'resubmit'; id: string; receipt?: Receipt; note: string; before: string }

export default function Submit({ onView, initialCase }: { onView: (id: string) => void; initialCase?: string }) {
  const { state } = useStore()
  const waiting = state.cases.filter(c => statusOf(state, c.id) === '待補件')
  const [tab, setTab] = useState<'new' | 'fix'>(initialCase ? 'fix' : 'new')
  const [job, setJob] = useState<Job | null>(null)
  return <div className="page submit">
    <div className="page-head"><h1>送件與進件</h1><p className="muted">左邊是員工在公司既有費用系統送件（示意），右邊是 CheckMate 收到後自動處理。CheckMate 不取代既有系統，而是接在它後面。</p></div>
    <div className="sub-grid">
      <section className="sys">
        <div className="sys-bar"><span className="sys-logo">費</span>公司費用系統<em>既有系統示意・非 CheckMate 畫面</em></div>
        <div className="sys-tabs"><button className={tab === 'new' ? 'on' : ''} onClick={() => setTab('new')}>新增申請</button><button className={tab === 'fix' ? 'on' : ''} onClick={() => setTab('fix')}>待補件<span>{waiting.length}</span></button></div>
        {tab === 'new' ? <NewClaim busy={!!job} onSubmit={item => setJob({ kind: 'new', item, id: `EXP-2026-${state.nextId}` })} />
          : <FixList busy={!!job} initial={initialCase} onSubmit={(id, receipt, note) => setJob({ kind: 'resubmit', id, receipt, note, before: latest(state, id).recommendation })} />}
      </section>
      <div className="flow-arrow"><ArrowRight size={26} /><small>API</small></div>
      <Intake job={job} onDone={() => {}} onView={onView} onReset={() => setJob(null)} />
    </div>
  </div>
}

function NewClaim({ busy, onSubmit }: { busy: boolean; onSubmit: (item: Omit<ExpenseCase, 'id'>) => void }) {
  const { state } = useStore()
  const [key, setKey] = useState<string>(SAMPLES[0].key)
  const sample = SAMPLES.find(s => s.key === key)
  const [form, setForm] = useState(SAMPLES[0].form)
  const [note, setNote] = useState('')
  const receipt = sample?.receipt
  const hints = useMemo(() => precheck(form, receipt, state.policy), [form, receipt, state.policy])
  const pick = (k: string) => { setKey(k); const s = SAMPLES.find(x => x.key === k); if (s) setForm(s.form); setNote('') }
  const set = (k: keyof typeof form, v: string) => setForm({ ...form, [k]: k === 'amount' ? Number(v.replace(/[^\d]/g, '')) || 0 : v })
  return <div className="sys-body">
    <h4>1. 附上憑證</h4>
    <div className="shots">
      {SAMPLES.map(s => <button key={s.key} className={key === s.key ? 'on' : ''} onClick={() => pick(s.key)}><Camera size={18} /><span><b>{s.label}</b><small>{s.hint}</small></span></button>)}
      <button className={key === 'none' ? 'on' : ''} onClick={() => setKey('none')}><AlertTriangle size={18} /><span><b>先不附憑證</b><small>看看會發生什麼</small></span></button>
    </div>
    <h4>2. 填寫申請</h4>
    <div className="form">
      <label>申請人<input value={form.applicant} onChange={e => set('applicant', e.target.value)} /></label>
      <label>費用類型<select value={form.category} onChange={e => set('category', e.target.value)}>{['住宿費', '交通費', '餐費', '軟體授權', '其他：研究材料'].map(c => <option key={c}>{c}</option>)}</select></label>
      <label>申請金額<input inputMode="numeric" value={form.amount} onChange={e => set('amount', e.target.value)} /></label>
      <label>消費日期<input value={form.date} onChange={e => set('date', e.target.value)} /></label>
      <label>出差地點<input value={form.tripCity ?? ''} placeholder="非出差可留空" onChange={e => set('tripCity', e.target.value)} /></label>
      <label>申報項目<input value={form.title} onChange={e => set('title', e.target.value)} /></label>
    </div>
    <div className="precheck">
      <div className="pc-head"><Sparkles size={17} /><b>CheckMate 送出前提醒</b><em>Concept・送出前驗證</em></div>
      {hints.length ? hints.map(h => <p key={h.key} className={`pc-${h.level}`}>{h.level === 'warn' ? <AlertTriangle size={16} /> : <Info size={16} />}{h.text}</p>)
        : <p className="pc-ok"><Check size={16} />看起來沒問題，可以送出。</p>}
      <small>提醒只供參考，不會擋下送出；最終仍由 CheckMate 初審與財務判斷。</small>
    </div>
    <label className="note-l">給財務的說明（選填）<textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder={hints.some(h => h.key === 'overLimit') ? '例如：展會期間房價上漲，已獲主管同意' : '例如：與客戶會議相關'} /></label>
    <button className="primary big" disabled={busy} onClick={() => onSubmit({ ...form, dept: form.dept, purpose: form.purpose, receipt, source: 'upload', applicantNote: note || undefined })}><Send size={18} />送出申請</button>
  </div>
}

function FixList({ busy, initial, onSubmit }: { busy: boolean; initial?: string; onSubmit: (id: string, receipt: Receipt | undefined, note: string) => void }) {
  const { state } = useStore()
  const waiting = state.cases.filter(c => statusOf(state, c.id) === '待補件')
  const [sel, setSel] = useState<string | undefined>(initial && waiting.some(c => c.id === initial) ? initial : waiting[0]?.id)
  const [attach, setAttach] = useState(true)
  const [note, setNote] = useState('')
  const item = waiting.find(c => c.id === sel)
  const supp = item && !item.receipt ? SUPPLEMENTS[item.id] ?? SAMPLES.find(s => s.form.category === item.category)?.receipt : undefined
  useEffect(() => { setAttach(true); setNote('') }, [sel])
  if (!waiting.length) return <div className="sys-body empty-fix"><Inbox size={30} /><p>目前沒有待補件的申請。</p><small>到「案件初審」把一筆案件「退回補件」，或讓 Agent 自動通知補件，再回來這裡以申請人身分補件。</small></div>
  const d = item && state.decisions[item.id]
  return <div className="sys-body">
    <div className="fix-list">{waiting.map(c => <button key={c.id} className={sel === c.id ? 'on' : ''} onClick={() => setSel(c.id)}><b>{c.id}</b><span>{c.title}</span><small>{c.applicant}</small></button>)}</div>
    {item && <>
      <div className="notice-in"><small>收到的補件通知・{d?.actor === 'Agent' ? 'CheckMate 自動寄出' : '財務寄出'}</small><pre>{d?.message ?? d?.note}</pre></div>
      {supp && <label className="attach"><input type="checkbox" checked={attach} onChange={e => setAttach(e.target.checked)} /><span><b>附上{item.category}憑證</b><small>{supp.vendor}・{supp.amount !== undefined ? money(supp.amount) : ''}</small></span></label>}
      <label className="note-l">補充說明<textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder={supp ? '選填' : '例如：差額為停車費，已附收據；或兩筆為不同行程'} /></label>
      <button className="primary big" disabled={busy || (!(supp && attach) && !note.trim())} onClick={() => onSubmit(item.id, supp && attach ? { ...supp, date: item.date } : undefined, note.trim())}><Send size={18} />送出補件</button>
    </>}
  </div>
}

function Intake({ job, onView, onReset }: { job: Job | null; onDone: () => void; onView: (id: string) => void; onReset: () => void }) {
  const { state, dispatch } = useStore()
  const [stage, setStage] = useState(-1)
  const [field, setField] = useState(0)
  useEffect(() => { if (job) { setStage(0); setField(0) } else setStage(-1) }, [job])
  useEffect(() => {
    if (!job || stage < 0 || stage >= STAGES.length) return
    if (stage === 2 && field < FIELDS.length) { const t = setTimeout(() => setField(field + 1), 320); return () => clearTimeout(t) }
    const t = setTimeout(() => {
      if (stage === 3) job.kind === 'new' ? dispatch({ type: 'add', item: job.item }) : dispatch({ type: 'resubmit', id: job.id, receipt: job.receipt, note: job.note })
      setStage(stage + 1)
    }, stage === 3 ? 1200 : 700)
    return () => clearTimeout(t)
  }, [job, stage, field, dispatch])
  if (!job) return <section className="intake idle"><div className="ck-bar"><span className="mark sm"><Check size={16} strokeWidth={3} /></span>CheckMate 收件</div><div className="idle-body"><Loader2 size={26} className="spin slow" /><p>等待費用系統送件…</p><small>在左邊以員工身分送出一筆申請</small></div></section>
  const rc = job.kind === 'new' ? job.item.receipt : job.receipt ?? state.cases.find(c => c.id === job.id)?.receipt
  const done = stage >= STAGES.length
  const item = done ? state.cases.find(c => c.id === job.id) : undefined
  const r = item && latest(state, item.id)
  const dec = item && state.decisions[item.id]
  const skipped = !rc
  return <section className="intake">
    <div className="ck-bar"><span className="mark sm"><Check size={16} strokeWidth={3} /></span>CheckMate 收件<em>{job.kind === 'new' ? '新申請' : `補件・${job.id}`}</em></div>
    <div className="stages v">{STAGES.map((s, i) => <div key={s} className={i < stage ? 'done' : i === stage ? 'now' : ''}><span>{i < stage ? <Check size={13} /> : i + 1}</span>{s}{i === 2 && <em>模擬擷取</em>}{skipped && (i === 1 || i === 2) && i < stage && <small>無憑證，略過</small>}</div>)}</div>
    {rc && stage >= 1 && <div className="ik-receipt"><ReceiptView receipt={rc} compact scanning={stage === 1} highlight={stage >= 2 ? FIELDS.slice(0, stage > 2 ? 5 : field).map(f => f.k) : []} /></div>}
    {done && item && r && <div className="ik-result">
      <div className="ir-checks">{r.checks.map(c => <div key={c.dim} className={`k-${c.kind}`}><b>{DIMS.find(d => d.key === c.dim)!.label}</b><span>{KIND_LABEL[c.kind]}</span></div>)}</div>
      <div className="ir-foot">
        <span>{job.kind === 'resubmit' && <><span className="muted">{job.before} → </span></>}<Badge value={r.recommendation} /></span>
        {dec?.actor === 'Agent' && dec.action === 'PROCEED' && <span className="auto"><Check size={15} />條件成立，Agent 已送往下一審核節點</span>}
      </div>
      <div className="ik-actions"><button onClick={onReset}>再送一筆</button><button className="primary" onClick={() => onView(item.id)}>到財務工作台查看<ArrowRight size={17} /></button></div>
    </div>}
  </section>
}
