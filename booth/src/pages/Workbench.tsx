import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Bot, Check, ChevronDown, ChevronRight, HelpCircle, Mail, Minus, Send, ShieldCheck, Sparkles, UserRound, X, Clock3 } from 'lucide-react'
import { money } from '../data'
import type { ExpenseCase } from '../data'
import { DIMS, KIND_LABEL, draftNotice, gate } from '../engine'
import type { CheckKind, Review } from '../engine'
import { latest, statusOf, useStore } from '../store'
import type { Status } from '../store'
import { Badge, Modal, ReceiptView, StatusChip, TONE } from '../components/ui'

const TABS: (Status | '全部')[] = ['待處理', '待補件', '已完成初審', '已轉交', '全部']
const KIND_ICON: Record<CheckKind, typeof Check> = { ok: Check, issue: X, missing: AlertTriangle, unknown: HelpCircle, na: Minus, wait: Clock3 }

export default function Workbench({ focus, clearFocus, onApplicant }: { focus?: string; clearFocus: () => void; onApplicant: (id: string) => void }) {
  const { state } = useStore()
  const [tab, setTab] = useState<Status | '全部'>('待處理')
  const [sel, setSel] = useState<string | undefined>(focus)
  const [agentOpen, setAgentOpen] = useState(false)
  useEffect(() => { if (focus) { setSel(focus); setTab('待處理'); clearFocus() } }, [focus, clearFocus])
  const rows = state.cases.filter(c => tab === '全部' || statusOf(state, c.id) === tab)
  const count = (t: Status | '全部') => state.cases.filter(c => t === '全部' || statusOf(state, c.id) === t).length
  const pending = state.cases.filter(c => !state.decisions[c.id])
  const agentable = pending.filter(c => !state.blocked[c.id] && latest(state, c.id).recommendation !== '建議人工審核').length
  const item = state.cases.find(c => c.id === sel)

  return <div className={`workbench${item ? ' with-detail' : ''}`}>
    <section className="list">
      <div className="list-head">
        <div><h1>案件初審</h1><p className="muted">{pending.length} 筆待處理・所有案件已由 CheckMate 完成 6 面向初審</p></div>
        <button className="primary big" disabled={!agentable} onClick={() => setAgentOpen(true)}><Bot size={20} />讓 Agent 處理{agentable ? `（${agentable} 筆）` : ''}</button>
      </div>
      <div className="hint"><Sparkles size={18} />試試看：點開一筆案件看審查依據，或按「讓 Agent 處理」，看它能自動完成哪些、又會把哪些留給你。</div>
      <div className="tabs">{TABS.map(t => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}<span>{count(t)}</span></button>)}</div>
      <div className="table">
        <div className="tr th"><span className="c-rec">初審建議</span><span className="c-id">案件編號</span><span className="c-title">申報項目</span><span className="c-sum">Agent 摘要</span><span className="c-amt">申請金額</span><span className="c-st">處理狀態</span></div>
        {rows.map(c => {
          const r = latest(state, c.id), top = r.checks.find(x => x.kind === 'issue' || x.kind === 'unknown' || x.kind === 'missing')
          return <button key={c.id} className={`tr${sel === c.id ? ' sel' : ''}`} onClick={() => setSel(c.id)}>
            <span className="c-rec"><Badge value={r.recommendation} /></span>
            <span className="c-id">{c.id}{c.source === 'upload' && <em className="new">新</em>}</span>
            <span className="c-title">{c.title}<small>{c.applicant}・{c.dept}</small></span>
            <span className="c-sum">{top ? top.summary : '資料齊全，核對無誤'}</span>
            <span className="c-amt">{money(c.amount)}</span>
            <span className="c-st"><StatusChip value={statusOf(state, c.id)} />{state.blocked[c.id] && !state.decisions[c.id] && <em className="blk">Agent 已攔截</em>}</span>
          </button>
        })}
        {!rows.length && <div className="empty">{tab === '待處理' ? '沒有待處理案件了。需要你判斷的，都已經處理完。' : `目前沒有${tab}的案件。`}</div>}
      </div>
    </section>
    {item && <Detail key={item.id + state.reviews[item.id].length} item={item} onClose={() => setSel(undefined)} onApplicant={onApplicant} />}
    {agentOpen && <AgentRun onClose={() => { setAgentOpen(false); setTab('待處理'); setSel(undefined) }} />}
  </div>
}

function CheckRow({ c, open, toggle }: { c: Review['checks'][number]; open: boolean; toggle: () => void }) {
  const dim = DIMS.find(d => d.key === c.dim)!, Icon = KIND_ICON[c.kind]
  return <div className={`check k-${c.kind}${open ? ' open' : ''}`}>
    <button className="check-main" onClick={toggle}>
      <span className="ci"><Icon size={17} /></span>
      <span className="cb"><b>{dim.label}<em className="grp">{dim.group}</em></b><span>{c.summary}</span></span>
      <span className="cr">{KIND_LABEL[c.kind]}</span>
      {open ? <ChevronDown size={18} className="chev" /> : <ChevronRight size={18} className="chev" />}
    </button>
    {open && <div className="basis"><div><small>比對內容</small>{c.basis}</div><div><small>依據</small>{c.rule}</div></div>}
  </div>
}

function Detail({ item, onClose, onApplicant }: { item: ExpenseCase; onClose: () => void; onApplicant: (id: string) => void }) {
  const { state, dispatch } = useStore()
  const r = latest(state, item.id), decision = state.decisions[item.id]
  const [open, setOpen] = useState<string | null>(() => r.checks.find(c => c.kind === 'issue' || c.kind === 'unknown' || c.kind === 'missing')?.dim ?? null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [modal, setModal] = useState<null | 'info' | 'override' | 'escalate'>(null)
  const g = useMemo(() => gate(item, r, state.policy), [item, r, state.policy])
  const canAgent = r.recommendation === '建議通過' && g.every(x => x.ok)
  const version = state.reviews[item.id].length

  return <aside className="detail">
    <header className="d-head">
      <div><small>{item.id}{version > 1 && <em className="rev">第 {version} 次審查・規範 v{r.policyVersion}</em>}</small><h2>{item.title}</h2></div>
      <div className="d-head-r"><Badge value={r.recommendation} /><button className="icon-btn" onClick={onClose} aria-label="關閉"><X size={20} /></button></div>
    </header>
    <div className="d-scroll">
      <dl className="facts">
        <div><dt>申請人</dt><dd>{item.applicant}・{item.dept}</dd></div>
        <div><dt>費用類型</dt><dd>{item.category}</dd></div>
        <div><dt>消費日期</dt><dd>{item.date}</dd></div>
        <div><dt>申請金額</dt><dd>{money(item.amount)}</dd></div>
        <div><dt>出差地點</dt><dd>{item.tripCity ?? '非出差'}</dd></div>
        <div><dt>進件來源</dt><dd>{item.channel ?? '費用系統 API'}</dd></div>
        <div className="wide"><dt>用途說明</dt><dd>{item.purpose}</dd></div>
        {item.applicantNote && <div className="wide note-box"><dt>申請人說明</dt><dd>{item.applicantNote}</dd></div>}
      </dl>

      <h3 className="sec">審查結果・6 個面向 <span className="muted">點一下看依據</span></h3>
      <div className="checks">{r.checks.map(c => <CheckRow key={c.dim} c={c} open={open === c.dim} toggle={() => setOpen(open === c.dim ? null : c.dim)} />)}</div>

      <button className="disclosure" onClick={() => setShowReceipt(!showReceipt)}>{showReceipt ? <ChevronDown size={18} /> : <ChevronRight size={18} />}憑證{item.receipt ? `・${item.receipt.id}・${item.receipt.vendor}` : '・未提供'}</button>
      {showReceipt && (item.receipt ? <div className="receipt-wrap"><ReceiptView receipt={item.receipt} compact /></div> : <div className="no-receipt"><AlertTriangle size={20} />申請人尚未附上{item.category}憑證</div>)}

      <section className={`rec r-${TONE[r.recommendation]}`}>
        <small className="tag">建議・Agent 判斷</small>
        <h3>{r.recommendation}</h3>
        <p>{r.recommendation === '建議通過' ? '6 個面向皆未見異常，可完成初審。' : r.recommendation === '建議補件' ? '缺少必要資料，補齊後可再次審查。' : '有需要專業判斷的項目，請確認後再決定下一步。'}</p>
      </section>

      <section className="gate">
        <div className="gate-head"><ShieldCheck size={20} /><b>Agent 執行條件</b><span className="muted">6 項同時成立，Agent 才能自己送出</span></div>
        <div className="gate-grid">{g.map(x => <div key={x.key} className={x.ok ? 'on' : 'off'}><span>{x.ok ? <Check size={14} /> : <X size={14} />}</span><b>{x.label}</b><small>{x.note}</small></div>)}</div>
        <p className={`gate-out ${canAgent ? 'ok' : 'no'}`}>{canAgent ? '條件全部成立：Agent 可直接送往下一審核節點。'
          : r.recommendation === '建議通過' ? `即使建議通過，${g.filter(x => !x.ok).map(x => x.label).join('、')}不成立，Agent 不會自動送出，會轉交給人。`
          : 'Agent 不會自動送出這筆，由你決定下一步。'}</p>
      </section>

      {state.blocked[item.id] && !decision && <section className="blocked"><ShieldCheck size={18} /><div><b>Agent 已攔截，轉給你判斷</b><p>{state.blocked[item.id]}</p></div></section>}
      {decision && <section className="decision"><b>{decision.action === 'PROCEED' ? <Check size={18} /> : decision.action === 'REQUEST_INFO' ? <Mail size={18} /> : <UserRound size={18} />}{statusOf(state, item.id)}</b>
        <p>{decision.note}</p>{decision.message && <pre>{decision.message}</pre>}
        <small>{decision.actor}・{decision.time}・原始建議：{decision.original}</small>
        {decision.action === 'REQUEST_INFO' && <button className="primary" onClick={() => onApplicant(item.id)}><UserRound size={17} />切換到申請人，模擬補件</button>}</section>}
      <History item={item} />
    </div>
    {!decision && <footer className="d-foot">
      <small className="tag">動作・由你決定</small>
      <button onClick={() => setModal('info')}><Mail size={18} />退回補件</button>
      <button onClick={() => setModal('escalate')}><UserRound size={18} />轉交進一步審查</button>
      {r.recommendation === '建議通過'
        ? <button className="primary" onClick={() => dispatch({ type: 'decide', id: item.id, decision: { action: 'PROCEED', actor: '財務初審人員', note: '已確認審查結果，完成初審' } })}><Send size={18} />完成初審</button>
        : <button className="primary" onClick={() => setModal('override')}><Check size={18} />人工確認通過</button>}
    </footer>}
    {modal === 'info' && <DraftModal item={item} r={r} onClose={() => setModal(null)} />}
    {(modal === 'override' || modal === 'escalate') && <ReasonModal mode={modal} item={item} onClose={() => setModal(null)} />}
  </aside>
}

function DraftModal({ item, r, onClose }: { item: ExpenseCase; r: Review; onClose: () => void }) {
  const { dispatch } = useStore()
  const [text, setText] = useState(() => draftNotice(item, r))
  return <Modal title={<><Mail size={20} />退回補件・CheckMate 已擬好通知</>} onClose={onClose} wide>
    <p className="to"><small>收件人</small>{item.applicant}（{item.dept}）</p>
    <textarea className="draft" value={text} onChange={e => setText(e.target.value)} rows={10} />
    <p className="note">內容依審查結果自動產生，可直接修改。此為模擬操作，不會真的寄出。</p>
    <div className="modal-actions"><button onClick={onClose}>取消</button><button className="primary" disabled={!text.trim()} onClick={() => { dispatch({ type: 'decide', id: item.id, decision: { action: 'REQUEST_INFO', actor: '財務初審人員', note: '已寄出補件通知', message: text } }); onClose() }}><Send size={18} />送出補件通知</button></div>
  </Modal>
}

function ReasonModal({ mode, item, onClose }: { mode: 'override' | 'escalate'; item: ExpenseCase; onClose: () => void }) {
  const { dispatch } = useStore()
  const [text, setText] = useState('')
  const presets = mode === 'override' ? ['已確認為行程異動，附主管核准', '已核對其他附件，資料無誤', '差額為合理支出，已確認'] : ['需主管確認例外核准', '需稽核確認憑證真偽', '金額較大，需進一步確認']
  return <Modal title={mode === 'override' ? '人工確認通過' : '轉交進一步審查'} onClose={onClose}>
    <p>{item.id}・{item.title}・{money(item.amount)}</p>
    <p className="note">{mode === 'override' ? '你的判斷與 Agent 建議不同，請留下原因。原始建議會一併保留。' : '請說明轉交原因，接手的人會看到完整審查依據。'}</p>
    <div className="presets">{presets.map(p => <button key={p} onClick={() => setText(p)}>{p}</button>)}</div>
    <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="請輸入原因" />
    <div className="modal-actions"><button onClick={onClose}>取消</button><button className="primary" disabled={!text.trim()} onClick={() => { dispatch({ type: 'decide', id: item.id, decision: { action: mode === 'override' ? 'PROCEED' : 'ESCALATE', actor: '財務初審人員', note: text } }); onClose() }}>確認</button></div>
  </Modal>
}

function AgentRun({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore()
  const [snapshot] = useState(() => state.cases.filter(c => !state.decisions[c.id] && !state.blocked[c.id]).map(c => {
    const r = latest(state, c.id), g = gate(c, r, state.policy), fail = g.filter(x => !x.ok)
    const res = r.recommendation === '建議通過' ? (fail.length ? { k: 'esc', t: `攔截・${fail.map(f => f.label).join('、')}不成立，轉給你` } : { k: 'go', t: '條件成立・已送往下一審核節點' })
      : r.recommendation === '建議補件' ? (state.policy.agentRequestInfo ? { k: 'info', t: '已寄出補件通知（自動擬稿）' } : { k: 'you', t: '補件通知權限未開啟・留給你' })
      : { k: 'you', t: '需要專業判斷・留給你' }
    return { c, r, res }
  }))
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (step < snapshot.length) { const t = setTimeout(() => setStep(step + 1), 550); return () => clearTimeout(t) }
    dispatch({ type: 'agentRun' })
  }, [step, snapshot.length, dispatch])
  const done = step >= snapshot.length
  const n = (k: string) => snapshot.filter(x => x.res.k === k).length
  return <Modal title={<><Bot size={20} />Agent 處理中</>} onClose={done ? onClose : () => {}} wide>
    <div className="run">{snapshot.map((x, i) => <div key={x.c.id} className={`run-row${i < step ? ' done' : i === step ? ' now' : ''} k-${x.res.k}`}>
      <span className="rid">{x.c.id}</span><span className="rt">{x.c.title}</span><Badge value={x.r.recommendation} /><span className="rres">{i < step ? x.res.t : i === step ? '檢查執行條件…' : ''}</span></div>)}</div>
    {done && <div className="run-sum">
      <div><b>{n('go')}</b><small>送往下一審核節點</small></div><div><b>{n('info')}</b><small>自動通知補件</small></div><div><b>{n('esc')}</b><small>超出授權・攔截轉人工</small></div><div className="you"><b>{n('you') + n('esc')}</b><small>留給你判斷</small></div>
    </div>}
    {done && <p className="payoff">需要你判斷的，才留給你。</p>}
    <div className="modal-actions"><button className="primary" disabled={!done} onClick={onClose}>{done ? '查看留給我的案件' : '處理中…'}</button></div>
  </Modal>
}

function History({ item }: { item: ExpenseCase }) {
  const { state } = useStore()
  const [open, setOpen] = useState(false)
  const reviews = state.reviews[item.id]
  const events = state.log.filter(e => e.caseId === item.id).slice().reverse()
  return <>
    <button className="disclosure" onClick={() => setOpen(!open)}>{open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}審查歷程・{reviews.length} 次審查・{events.length} 個動作</button>
    {open && <div className="history">
      {reviews.map((r, i) => {
        const prev = reviews[i - 1]
        const changed = prev ? r.checks.filter((c, k) => c.kind !== prev.checks[k].kind) : []
        return <div key={i} className="h-rev">
          <div className="h-top"><b>第 {i + 1} 次審查</b><span className="muted">{r.trigger}・{r.time}</span><Badge value={r.recommendation} /></div>
          {prev && (changed.length ? <ul>{prev.recommendation !== r.recommendation && <li>建議：{prev.recommendation} → {r.recommendation}</li>}
            {changed.map(c => <li key={c.dim}>{DIMS.find(d => d.key === c.dim)!.label}：{KIND_LABEL[prev.checks.find(x => x.dim === c.dim)!.kind]} → {KIND_LABEL[c.kind]}</li>)}</ul>
            : <p className="muted">與上次相比沒有變化</p>)}
        </div>
      })}
      <div className="h-events">{events.map(e => <div key={e.id}><span className="muted">{e.time}</span><b>{e.actor}</b><span>{e.action}</span><small>{e.detail}</small></div>)}</div>
    </div>}
  </>
}
