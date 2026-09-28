import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle, Check, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Filter, HelpCircle, Menu, Minus, PanelLeftClose, Search, Sparkles, X } from 'lucide-react'
import { cases, caseSummary, expenseLines, dimensionLabels, dimensions, money } from './data/cases'
import type { ExpenseCase, Recommendation, Review } from './data/cases'
import { completeBatch, filterByProgress, progressViews, filterCases, recordDecision } from './features/review/workbench'
import type { Decision, ProgressView } from './features/review/workbench'

const recommendations: Recommendation[] = ['建議通過', '建議補件', '建議人工審核']
const latest = (item: ExpenseCase) => item.reviews.at(-1)!
function Badge({ value }: { value: Recommendation }) {
  return <span className={`badge tone-${recommendations.indexOf(value)}`}><span />{value}</span>
}
function agentSummary(review: Review): string {
  return review.findings.length ? review.findings[0].title : '資料齊全，核對無誤'
}
function RecommendationCard({ review }: { review: Review }) {
  const body = review.recommendation === '建議通過' ? '資料齊全，核對無誤，可完成初審。'
    : review.findings.map(f => f.id === 'missing-transport' ? '請補充 09/19 交通費 NT$480 的憑證。' : f.id === 'missing-receipt' ? '請補充住宿憑證。' : f.explanation).join(' ')
  return <section className={`recommendation-card tone-${recommendations.indexOf(review.recommendation)}`} aria-labelledby="recommendation-heading">
    <h2 id="recommendation-heading">{review.recommendation}</h2>
    <p>{body}</p>
    {review.findings[0] && <p className="recommendation-rule">適用規範：{review.findings[0].rule}</p>}
  </section>
}
function ReviewBody({ item, review }: { item: ExpenseCase; review: Review }) {
  const lines = expenseLines(item)
  const [lineId, setLineId] = useState(lines[0].id)
  const [zoom, setZoom] = useState(false)
  const line = lines.find(l => l.id === lineId) ?? lines[0]
  const evidence = review.evidence.filter(e => line.evidenceIds.includes(e.id))
  const methods = ['逐筆核對申報金額與對應憑證，確認必要附件。', '依費用類型套用企業規範與上限。', '依示範格式規則確認適用門檻及統一編號欄位。', '比對既有案件的申請人、商家、日期及金額。']
  return <>
    <section className="application-section" aria-labelledby="application-heading"><h2 id="application-heading">申請資訊</h2>
      <h3>基本資訊</h3><dl className="application-facts"><div><dt>申請人</dt><dd>{item.applicant}</dd></div><div><dt>員工編號</dt><dd>{item.employeeId ?? '未提供'}</dd></div><div><dt>申請部門</dt><dd>{item.department}</dd></div><div><dt>申請日期</dt><dd>{item.submittedAt ?? '未提供'}</dd></div></dl>
      <h3>費用明細</h3><div className="line-table-wrap"><table className="line-table"><thead><tr><th>消費日期</th><th>費用類型</th><th className="amount-cell">未稅</th><th className="amount-cell">稅額</th><th className="amount-cell">總計</th></tr></thead><tbody>{lines.map(l => <tr key={l.id} className={l.id === line.id ? 'selected-row' : ''} onClick={() => setLineId(l.id)}><td>{l.date}</td><td><button className="case-link" onClick={() => setLineId(l.id)} aria-pressed={l.id === line.id}>{l.category}</button></td><td className="amount-cell">{l.netAmount === undefined ? '未提供' : money(l.netAmount)}</td><td className="amount-cell">{l.taxAmount === undefined ? '未提供' : money(l.taxAmount)}</td><td className="amount-cell">{money(l.amount)}</td></tr>)}</tbody></table></div>
      <dl className="application-facts summary-facts"><div><dt>用途說明</dt><dd>{item.description}</dd></div><div><dt>申請總額</dt><dd className="application-total">{money(item.amount)}</dd></div></dl>
      <h3>付款資訊</h3><dl className="application-facts"><div><dt>支付方式</dt><dd>{item.paymentMethod ?? '未提供'}</dd></div></dl>
    </section>
    <section className="audit-section" aria-labelledby="audit-heading"><h2 id="audit-heading">審查結果與比對</h2>
      <div className="audit-grid">
        <div className="check-list" role="list">{dimensions.map((dimension, index) => {
          const finding = review.findings.find(f => f.dimension === dimension)
          const notApplicable = !finding && review.checks[index].startsWith('不適用')
          const kind = finding ? finding.kind === '缺漏' ? 'missing' : finding.kind === '無法判斷' ? 'unknown' : 'issue' : notApplicable ? 'na' : 'ok'
          const label = { ok: '未見異常', issue: '需確認', missing: '缺件', unknown: '無法判斷', na: '不適用' }[kind]
          const Icon = { ok: Check, issue: X, missing: AlertTriangle, unknown: HelpCircle, na: Minus }[kind]
          return <div className={`finding-row check-${kind}`} key={dimension} role="listitem">
            <Icon size={16} className="check-icon" aria-hidden="true" />
            <div className="check-body">
              <div className="check-heading"><strong>{dimensionLabels[dimension]}</strong><span className="check-result-label">{label}</span></div>
              <p className="check-summary">{finding ? finding.title.replace('示範上限', '企業上限') : review.checks[index]}{finding && finding.comparison.length > 0 && <span className="check-figures"> — {finding.comparison.map(([k, v]) => `${k} ${v}`).join('，')}</span>}</p>
              {finding?.related && <p className="check-related">關聯案件：EXP-2026-018。相同欄位是待確認訊號，不代表已認定重複報銷。</p>}
              <details className="audit-basis"><summary>規則依據</summary><p>{methods[index]}</p>{finding && <p>{finding.rule}</p>}</details>
            </div>
          </div>
        })}</div>
        <details className="evidence-section" aria-label="憑證預覽"><summary>憑證比對</summary><div className="evidence-body">{evidence.length > 0 && <div className="evidence-heading"><button onClick={() => setZoom(true)}>放大檢視</button></div>}<div className="evidence-tabs">{lines.map(l => <button key={l.id} aria-pressed={l.id === line.id} onClick={() => setLineId(l.id)}>{l.category}</button>)}</div><p className="line-description">{line.date} · {line.description}</p><dl className="receipt-comparison"><div><dt>申報金額</dt><dd>{money(line.amount)}</dd></div><div><dt>憑證金額</dt><dd>{evidence.length ? money(evidence.reduce((sum, e) => sum + e.amount, 0)) : '未提供'}</dd></div></dl>{evidence.length ? evidence.map(e => <figure key={e.id}><img className="receipt" src={`/fixtures/${e.id}.svg`} alt={`${e.vendor}模擬憑證，金額${money(e.amount)}`} /><figcaption>{e.id} · {e.vendor}</figcaption></figure>) : <div className="no-evidence"><ClipboardList size={28} /><strong>未提供{line.category}憑證</strong></div>}</div></details>
      </div>
    </section>
    <RecommendationCard review={review} />
    {zoom && <Modal title={`${line.category}憑證`} close={() => setZoom(false)}>{evidence.map(e => <img key={e.id} className="receipt enlarged" src={`/fixtures/${e.id}.svg`} alt={`${e.vendor}模擬憑證，金額${money(e.amount)}`} />)}</Modal>}
  </>
}
function Modal({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { ref.current?.showModal(); const dialog = ref.current; return () => dialog?.close() }, [])
  return <dialog ref={ref} onCancel={close} aria-labelledby="modal-title"><div className="modal-heading"><h2 id="modal-title">{title}</h2><button className="icon-button" onClick={close} aria-label="關閉"><X size={20} /></button></div>{children}</dialog>
}
function CaseDetail({ item, decision, save, close, previous, next, expanded, expand }: { expanded: boolean; expand: () => void; item: ExpenseCase; decision?: Decision; save: (d: Decision) => void; close: () => void; previous: () => void; next: () => void }) {
  const [reviewId, setReviewId] = useState(latest(item).id)
  const [action, setAction] = useState<'PROCEED' | 'REQUEST_INFO' | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const review = item.reviews.find(r => r.id === reviewId)!
  const historical = reviewId !== latest(item).id
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => { headingRef.current?.focus() }, [])
  function openAction(value: 'PROCEED' | 'REQUEST_INFO') { setAction(value); setError(''); setReason(value === 'REQUEST_INFO' && review.findings.length ? `請補充「${review.findings.map(f => f.title).join('、')}」的相關說明或憑證。` : '') }
  function submit(event: React.FormEvent) { event.preventDefault(); try { save(recordDecision(item, decision, action!, reason, reviewId)); setAction(null); requestAnimationFrame(() => headingRef.current?.focus()) } catch (e) { setError((e as Error).message) } }
  return <aside className="detail-panel" aria-label={`${item.id} 案件詳情`}>
    <div className="detail-toolbar"><button onClick={expand}>{expanded ? '返回並排' : '展開詳情'}</button><div><button onClick={previous}><ChevronLeft size={17} />上一筆</button><button onClick={next}>下一筆<ChevronRight size={17} /></button><button onClick={close} className="icon-button" aria-label="關閉案件詳情"><X size={20} /></button></div></div>
    <header className="case-heading fixed-case-heading"><span className="muted">{item.id}</span><div><h1 ref={headingRef} tabIndex={-1}>{caseSummary(item)}</h1></div><Badge value={review.recommendation} /></header><div className="detail-scroll">
      {historical && <div className="notice">正在查看歷史紀錄，無法執行處理。<button onClick={() => setReviewId(latest(item).id)}>回到最新紀錄</button></div>}
      {decision && !historical && <section className="decision"><strong><Check size={17} />{decision.status}</strong><p>{decision.reason || '已確認初審結果。'}</p><small>{decision.actor} · {new Date(decision.time).toLocaleString('zh-TW')}</small></section>}
      <ReviewBody key={review.id} item={item} review={review} />
      <details className="disclosure"><summary>初審紀錄（{item.reviews.length}）</summary>{item.reviews.slice().reverse().map(r => <button className={`history-row ${r.id === reviewId ? 'current' : ''}`} key={r.id} onClick={() => setReviewId(r.id)}><span>{r.time}<small>{r.id}</small></span><span>{r.recommendation}{r.id === reviewId && ' · 檢視中'}</span></button>)}</details>
    </div>
    <footer className="action-bar">{historical ? <button className="primary" onClick={() => setReviewId(latest(item).id)}>回到最新紀錄</button> : decision ? <><span>{decision.status}</span><button onClick={next}>下一筆案件<ChevronRight size={17} /></button></> : <><button className={review.recommendation === '建議補件' ? 'primary' : ''} onClick={() => openAction('REQUEST_INFO')}>退回補件</button><button className={review.recommendation === '建議補件' ? '' : 'primary'} onClick={() => openAction('PROCEED')}>{review.recommendation === '建議通過' ? '完成初審' : '人工確認通過'}</button></>}</footer>
    {action && <Modal title={action === 'REQUEST_INFO' ? '退回補件' : review.recommendation === '建議通過' ? '完成初審' : '人工確認通過'} close={() => setAction(null)}><form onSubmit={submit}><p>{item.id} · {item.applicant} · {money(item.amount)}</p>{action === 'REQUEST_INFO' ? <p>補件對象：{item.applicant}（{item.department}）</p> : <p>確認此案件已完成財務初審。這不代表最終核准或付款。</p>}{(action === 'REQUEST_INFO' || review.recommendation !== '建議通過') && <label className="form-label">{action === 'REQUEST_INFO' ? '補件內容' : '審核說明'}<textarea required value={reason} onChange={e => setReason(e.target.value)} placeholder="請記錄確認結果與依據" rows={4} /></label>}<p className="simulation">本次為模擬操作，僅記錄在目前畫面，不會發送通知或推進外部流程。</p>{error && <p role="alert" className="error">{error}</p>}<div className="modal-actions"><button type="button" onClick={() => setAction(null)}>取消</button><button className="primary" type="submit">{action === 'REQUEST_INFO' ? '確認退回補件' : '確認完成'}</button></div></form></Modal>}
  </aside>
}
export default function App() {
  const navigate = useNavigate(); const location = useLocation()
  const selected = cases.find(item => location.pathname === `/cases/${item.id}`)
  const [collapsed, setCollapsed] = useState(false)
  const [idQuery, setIdQuery] = useState(''); const [nameQuery, setNameQuery] = useState('')
  const [filters, setFilters] = useState<Recommendation[]>([])
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  const [progress, setProgress] = useState<ProgressView>('待處理')
  const [lastHandled, setLastHandled] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)
  const [checked, setChecked] = useState<string[]>([])
  const [batchOpen, setBatchOpen] = useState(false)
  const [batchError, setBatchError] = useState('')
  const [about, setAbout] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const filtered = filterCases(filterByProgress(cases, decisions, progress), idQuery, nameQuery, filters)
  const eligible = filtered.filter(c => latest(c).recommendation === '建議通過' && !decisions[c.id])
  const picked = eligible.filter(c => checked.includes(c.id))
  const batchMode = (progress === '待處理' || progress === '全部') && filters.length === 1 && filters[0] === '建議通過'
  const stickyIdLeft = batchMode ? 40 : 0
  const stickySummaryLeft = stickyIdLeft + 130
  const narrow = collapsed || !!selected
  function close() { setExpanded(false); const id = selected?.id; navigate('/'); requestAnimationFrame(() => document.getElementById(`open-${id}`)?.focus()) }
  function select(item: ExpenseCase) { navigate(`/cases/${item.id}`) }
  function changeProgress(view: ProgressView) { setProgress(view); setChecked([]); if (selected && !filterByProgress([selected], decisions, view).length) close() }
  function handled(result: Record<string, Decision>) {
    const updated = { ...decisions, ...result }
    const ids = Object.keys(result)
    setDecisions(updated); setChecked([]); setLastHandled(ids)
    setAnnouncement(ids.length === 1 ? `${ids[0]}：${result[ids[0]].status === '待補件' ? '已退回補件' : '已完成初審'}` : `已完成 ${ids.length} 筆初審`)
    if (selected && !filterByProgress([selected], updated, progress).length) close()
  }
  useEffect(() => {
    if (!lastHandled.length) return
    const timer = setTimeout(() => setLastHandled([]), 2500)
    return () => clearTimeout(timer)
  }, [lastHandled])
  function adjacent(delta: number) { const index = filtered.findIndex(c => c.id === selected?.id); if (filtered.length) select(filtered[(index + delta + filtered.length) % filtered.length]) }
  function updateFilters(values: Recommendation[]) { setChecked([]); setFilters(values); if (selected && !filterCases([selected], idQuery, nameQuery, values).length) navigate('/') }
  function updateQuery(value: string, kind: 'id' | 'name') { setChecked([]); if (kind === 'id') setIdQuery(value); else setNameQuery(value); if (selected && !filterCases([selected], kind === 'id' ? value : idQuery, kind === 'name' ? value : nameQuery, filters).length) navigate('/') }
  return <div className={`app-shell ${narrow ? 'nav-collapsed' : ''}`}>
    <nav className="sidebar" aria-label="主要導覽"><a className="brand" href="/" onClick={e => { e.preventDefault(); navigate('/') }} aria-label="CheckMate 首頁"><span className="brand-mark"><Check size={22} strokeWidth={3} /></span>{!narrow && <span>CheckMate</span>}</a><div className="nav-group">{!narrow && <span className="nav-caption">工作空間</span>}<button className="nav-item active" aria-current="page" title="案件初審" onClick={() => navigate('/')}><ClipboardList size={21} />{!narrow && '案件初審'}</button></div><button className="nav-toggle" title={narrow ? '展開導覽' : '收合導覽'} onClick={() => { if (selected) close(); setCollapsed(!narrow) }}>{narrow ? <Menu size={20} /> : <><PanelLeftClose size={20} />收合導覽</>}</button></nav>
    <div className="workspace"><header className="topbar"><span>財務工作台</span><details className="account"><summary><span className="avatar">財</span><span>財務初審人員</span><ChevronDown size={15} /></summary><div className="account-menu"><strong>財務初審人員</strong><p>CheckMate 工作空間</p><button onClick={e => { setAbout(true); e.currentTarget.closest('details')?.removeAttribute('open') }}>關於此展示</button></div></details></header>
    <main className={`workbench ${selected ? 'with-detail' : ''} ${selected && expanded ? 'detail-expanded' : ''}`}><section className="list-panel" aria-label="案件列表"><div className="list-header"><div><h1>案件初審</h1><span className="muted">{cases.filter(c => !decisions[c.id]).length} 筆待處理</span></div></div>
    <div className="tabs" aria-label="依處理進度檢視">{progressViews.map(view => <button key={view} className={progress === view ? 'selected' : ''} aria-pressed={progress === view} onClick={() => changeProgress(view)}>{view}<span>{filterByProgress(cases, decisions, view).length}</span></button>)}</div>
    {lastHandled.length > 0 && <div className="completion-notice" role="status"><span>{announcement}</span></div>}
    <div className="searchbar"><label><Search size={17} /><input aria-label="搜尋案件編號" placeholder="搜尋案件編號" value={idQuery} onChange={e => updateQuery(e.target.value, 'id')} /></label><label><Search size={17} /><input aria-label="搜尋申請人" placeholder="搜尋申請人" value={nameQuery} onChange={e => updateQuery(e.target.value, 'name')} /></label><details className="filter-menu"><summary title="複選初審建議"><Filter size={17} />初審建議{filters.length > 0 && <span>{filters.length}</span>}</summary><div><strong>初審建議</strong>{recommendations.map(r => <label key={r}><input type="checkbox" checked={filters.includes(r)} onChange={() => updateFilters(filters.includes(r) ? filters.filter(v => v !== r) : [...filters, r])} />{r}</label>)}<button onClick={() => updateFilters([])}>清除篩選</button></div></details></div>
    <div className="table-scroll"><table><thead><tr>
      {batchMode && <th className="selection-cell sticky-col" style={{ left: 0 }}><input type="checkbox" aria-label="選取所有可處理案件" checked={eligible.length > 0 && picked.length === eligible.length} disabled={!eligible.length} onChange={e => setChecked(e.target.checked ? eligible.map(c => c.id) : [])} /></th>}
      <th className="sticky-col" style={{ left: stickyIdLeft }}>案件編號</th>
      <th className="sticky-col sticky-col-end" style={{ left: stickySummaryLeft }}>申報項目</th>
      <th><span className="icon-label ai-marker"><Sparkles size={14} />初審建議</span></th>
      <th><span className="icon-label ai-marker"><Sparkles size={14} />初審結果</span></th>
      <th>費用類型</th><th>申請部門</th><th>申請人</th><th className="amount-cell">申請金額</th>{progress === '全部' && <th>處理狀態</th>}<th>申請日期</th>
    </tr></thead><tbody>{filtered.map(item => <tr key={item.id} className={selected?.id === item.id ? 'selected-row' : ''} onClick={() => select(item)}>
      {batchMode && <td className="selection-cell sticky-col" style={{ left: 0 }} onClick={e => e.stopPropagation()}><input type="checkbox" aria-label={`選取 ${item.id}`} disabled={!!decisions[item.id]} checked={picked.some(c => c.id === item.id)} onChange={e => setChecked(current => e.target.checked ? [...current, item.id] : current.filter(id => id !== item.id))} /></td>}
      <td className="sticky-col" style={{ left: stickyIdLeft }}><button id={`open-${item.id}`} className="case-link" onClick={e => { e.stopPropagation(); select(item) }} aria-label={`開啟 ${item.id} ${item.applicant}`} aria-expanded={selected?.id === item.id}>{item.id}</button></td>
      <td className="summary-cell sticky-col sticky-col-end" style={{ left: stickySummaryLeft }}><span className="clamp-2" title={caseSummary(item)}>{caseSummary(item)}</span></td>
      <td><Badge value={latest(item).recommendation} /></td>
      <td className="summary-cell"><span className="clamp-2" title={agentSummary(latest(item))}>{agentSummary(latest(item))}</span></td>
      <td>{item.category}</td><td>{item.department}</td><td>{item.applicant}</td><td className="amount-cell">{money(item.amount)}</td>{progress === '全部' && <td><span className={`badge ${decisions[item.id]?.status === '初審完成' ? 'tone-0' : decisions[item.id]?.status === '待補件' ? 'tone-1' : ''}`}><span />{decisions[item.id]?.status === '初審完成' ? '已完成初審' : decisions[item.id]?.status ?? '待處理'}</span></td>}<td>{item.submittedAt ?? '未提供'}</td>
    </tr>)}</tbody></table>{!filtered.length && <div className="empty"><Search size={26} /><h2>{idQuery || nameQuery || filters.length ? '找不到符合的案件' : progress === '待處理' ? '目前沒有待處理案件' : `目前沒有${progress}案件`}</h2><p>可切換處理進度或調整搜尋條件。</p><button onClick={() => { setIdQuery(''); setNameQuery(''); setFilters([]) }}>清除所有條件</button></div>}</div><div className="list-footer"><span>共 {filtered.length} 筆案件</span>{batchMode && <div className="batch-actions"><span>已選 {picked.length} 筆</span><button className="primary" disabled={!picked.length} onClick={() => { setBatchError(''); setBatchOpen(true) }}>完成所選初審</button></div>}</div></section>
    {selected && <CaseDetail expanded={expanded} expand={() => setExpanded(value => !value)} key={selected.id} item={selected} decision={decisions[selected.id]} close={close} previous={() => adjacent(-1)} next={() => adjacent(1)} save={decision => handled({ [selected.id]: decision })} />}</main></div><div className="sr-only" aria-live="polite">{announcement}</div>
    {batchOpen && <Modal title="完成所選初審" close={() => setBatchOpen(false)}><p>{picked.length} 筆案件 · 合計 {money(picked.reduce((sum, c) => sum + c.amount, 0))}</p><ul>{picked.map(c => <li key={c.id}>{c.id} · {c.applicant} · {money(c.amount)}</li>)}</ul><p className="simulation">僅模擬完成財務初審，不代表最終核准，不會推進外部流程。</p>{batchError && <p role="alert">{batchError}</p>}<div className="modal-actions"><button onClick={() => setBatchOpen(false)}>取消</button><button className="primary" onClick={() => { try { const result = completeBatch(picked, decisions); handled(result); setBatchOpen(false) } catch (e) { setBatchError((e as Error).message) } }}>確認完成</button></div></Modal>}
    {about &&<Modal title="關於此展示" close={() => setAbout(false)}><p>CheckMate 費用案件初審操作原型。</p><p>所有案件、規範與初審結果皆為預置模擬資料，尚未串接 OCR、AI 分析、通知或審核系統。重新整理後會還原處理狀態。</p><p>初審建議僅供財務人員判斷，不代表最終核准、付款或稅務認定。</p><div className="modal-actions"><button className="primary" onClick={() => setAbout(false)}>知道了</button></div></Modal>}
  </div>
}
