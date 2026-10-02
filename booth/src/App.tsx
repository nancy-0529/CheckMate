import { useCallback, useEffect, useState } from 'react'
import { Check, ClipboardList, FileScan, History, RotateCcw, Scale } from 'lucide-react'
import { StoreProvider, useStore } from './store'
import Workbench from './pages/Workbench'
import Submit from './pages/Submit'
import Policy from './pages/Policy'
import Audit from './pages/Audit'
import { Modal } from './components/ui'

type Page = 'work' | 'ingest' | 'policy' | 'audit'
const NAV: { key: Page; label: string; icon: typeof Check }[] = [
  { key: 'work', label: '案件初審', icon: ClipboardList },
  { key: 'ingest', label: '送件與進件', icon: FileScan },
  { key: 'policy', label: '企業規範', icon: Scale },
  { key: 'audit', label: '處理紀錄', icon: History },
]

function Shell() {
  const { state, dispatch } = useStore()
  const [page, setPage] = useState<Page>('work')
  const [focus, setFocus] = useState<string>()
  const [applicantCase, setApplicantCase] = useState<string>()
  const [confirmReset, setConfirmReset] = useState(false)
  const [toast, setToast] = useState(''); const [toastGo, setToastGo] = useState(false)
  const clearFocus = useCallback(() => setFocus(undefined), [])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 4200); return () => clearTimeout(t) }, [toast])
  const pending = state.cases.filter(c => !state.decisions[c.id]).length

  return <div className="shell">
    <nav className="side">
      <div className="brand"><span className="mark"><Check size={22} strokeWidth={3} /></span>CheckMate</div>
      {NAV.map(n => <button key={n.key} className={page === n.key ? 'on' : ''} onClick={() => { setApplicantCase(undefined); setPage(n.key) }}><n.icon size={20} />{n.label}{n.key === 'work' && pending > 0 && <span className="cnt">{pending}</span>}</button>)}
      <div className="side-foot">示範環境・所有案件、規範與憑證皆為模擬資料</div>
    </nav>
    <div className="main">
      <header className="top">
        <span className="muted">財務工作台</span>
        <span className="top-r"><span className="avatar">財</span>財務初審人員<button className="reset" onClick={() => setConfirmReset(true)}><RotateCcw size={17} />重新開始</button></span>
      </header>
      <div className="content">
        {page === 'work' && <Workbench focus={focus} clearFocus={clearFocus} onApplicant={id => { setApplicantCase(id); setPage('ingest') }} />}
        {page === 'ingest' && <Submit key={applicantCase ?? 'new'} initialCase={applicantCase} onView={id => { setApplicantCase(undefined); setFocus(id); setPage('work') }} />}
        {page === 'policy' && <Policy onSaved={() => { setToastGo(true); setToast('__policy__') }} />}
        {page === 'audit' && <Audit />}
      </div>
    </div>
    {toast && <div className="toast">{toast === '__policy__' ? `規範 v${state.policy.version} 已生效：${state.log[0].detail}` : toast}{toastGo && page !== 'work' && <button onClick={() => { setPage('work'); setToast('') }}>查看案件</button>}</div>}
    {confirmReset && <Modal title="重新開始體驗？" onClose={() => setConfirmReset(false)}>
      <p>所有案件、處理結果、規範修改與紀錄都會回到初始狀態，讓下一位來賓從頭體驗。</p>
      <div className="modal-actions"><button onClick={() => setConfirmReset(false)}>取消</button><button className="primary" onClick={() => { dispatch({ type: 'reset' }); setPage('work'); setFocus(undefined); setConfirmReset(false); setToastGo(false); setToast('已重設為初始狀態') }}><RotateCcw size={18} />重新開始</button></div>
    </Modal>}
  </div>
}

export default function App() { return <StoreProvider><Shell /></StoreProvider> }
