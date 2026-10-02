import { Bot, Settings, UserRound } from 'lucide-react'
import { useStore } from '../store'

const ICON = { Agent: Bot, 財務初審人員: UserRound, 系統: Settings }
export default function Audit() {
  const { state } = useStore()
  return <div className="page audit">
    <div className="page-head"><h1>處理紀錄</h1><p className="muted">每個判斷與動作都會留下紀錄：誰做的、什麼時候、依據什麼。人工覆寫會保留原始建議。</p></div>
    <div className="card log">{state.log.map(e => { const I = ICON[e.actor]; return <div key={e.id} className={`ev a-${e.actor === 'Agent' ? 'agent' : e.actor === '系統' ? 'sys' : 'human'}`}>
      <span className="ev-t">{e.time}</span><span className="ev-a"><I size={16} />{e.actor}</span><span className="ev-b"><b>{e.action}</b>{e.caseId && <em>{e.caseId}</em>}<small>{e.detail}</small></span></div> })}</div>
  </div>
}
