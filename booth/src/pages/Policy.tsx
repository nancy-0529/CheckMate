import { useState } from 'react'
import { Lightbulb, History, Link2, ListChecks, ShieldAlert, ShieldCheck, TrendingUp, BadgeCheck, Save } from 'lucide-react'
import { LIMIT_UNIT, PAST_DECISIONS, RULE_IDS, money } from '../data'
import { latest } from '../store'
import type { Policy as P } from '../data'
import { useStore } from '../store'

const CONTROLS = [
  { icon: ListChecks, name: '必要檢核', en: 'Required Checks', d: '6 個面向都要有結果，沒查完不給建議。' },
  { icon: ShieldAlert, name: '強制防護', en: 'Hard Guardrails', d: '超額、超出授權等紅線，一律攔下。' },
  { icon: BadgeCheck, name: '獨立驗證', en: 'Independent Verification', d: '送出前再檢查一次執行條件。' },
  { icon: Link2, name: '佐證鏈', en: 'Evidence Chain', d: '每個判斷都連回規則與憑證，隨時回查。' },
  { icon: TrendingUp, name: '漸進式自動化', en: 'Progressive Automation', d: '先授權低風險案件，驗證後再逐步放寬。' },
  { icon: History, name: '執行後監控', en: 'Post-action Monitoring', d: '所有動作留下紀錄，有異常就調整授權。' },
]

export default function Policy({ onSaved }: { onSaved: () => void }) {
  const { state, dispatch } = useStore()
  const [p, setP] = useState<P>(state.policy)
  const dirty = JSON.stringify({ ...p, version: 0 }) !== JSON.stringify({ ...state.policy, version: 0 })
  const sessionOverrides: Record<string, number> = {}
  for (const [id, d] of Object.entries(state.decisions)) {
    if (d.actor === 'Agent' || d.action !== 'PROCEED' || d.original === '建議通過') continue
    for (const c of latest(state, id).checks) if (c.kind === 'issue') { const r = c.rule.split('｜')[0]; sessionOverrides[r] = (sessionOverrides[r] ?? 0) + 1 }
  }
  const stats = PAST_DECISIONS.map(x => { const extra = sessionOverrides[x.rule] ?? 0; return { ...x, flagged: x.flagged + extra, overridden: x.overridden + extra, extra } })
  const RULE_NAME: Record<string, string> = { 'P-01': '住宿費每晚上限', 'X-01': '情境合理性（出差地點）', 'R-01': '重複申報比對' }
  const num = (v: string) => Number(v.replace(/[^\d]/g, '')) || 0
  const Toggle = ({ k, label, desc }: { k: 'duplicate' | 'context' | 'authenticity' | 'agentProceed' | 'agentRequestInfo'; label: string; desc: string }) =>
    <label className="toggle"><input type="checkbox" checked={p[k]} onChange={e => setP({ ...p, [k]: e.target.checked })} /><span className="sw" /><span><b>{label}</b><small>{desc}</small></span></label>

  return <div className="page policy">
    <div className="page-head"><h1>企業規範</h1><p className="muted">目前版本 v{state.policy.version}。修改後按儲存，待處理案件會依新規範重新審查，並保留每次審查紀錄。</p></div>
    <div className="pol-grid">
      <section className="card">
        <h3 className="sec">費用上限</h3>
        <div className="rules">{Object.keys(p.limits).map(cat => <div key={cat} className="rule-row">
          <span className="rid">{RULE_IDS[cat]}</span><span className="rn">{cat}<small>{LIMIT_UNIT[cat]}上限</small></span>
          <span className="rin">NT$<input inputMode="numeric" value={p.limits[cat].toLocaleString('en-US')} onChange={e => setP({ ...p, limits: { ...p.limits, [cat]: num(e.target.value) } })} /></span></div>)}
          <div className="rule-row"><span className="rid">P-02</span><span className="rn">必要附件<small>每筆費用須附對應憑證</small></span><span className="rfix">固定規則</span></div>
          <div className="rule-row"><span className="rid">C-01</span><span className="rn">統一編號門檻<small>達此金額須有統一編號（示範）</small></span><span className="rin">NT$<input inputMode="numeric" value={p.taxIdThreshold.toLocaleString('en-US')} onChange={e => setP({ ...p, taxIdThreshold: num(e.target.value) })} /></span></div>
        </div>
      </section>
      <section className="card">
        <h3 className="sec">規則之外的風險檢查</h3>
        <Toggle k="duplicate" label="重複／拆單比對" desc="R-01 重複申報・R-02 同日同商家拆單" />
        <Toggle k="context" label="情境合理性" desc="X-01｜比對出差行程與消費地點" />
        <Toggle k="authenticity" label="憑證真偽風險" desc="A-01｜比對同商家歷史憑證版型（模擬訊號）" />
        <h3 className="sec" style={{ marginTop: 28 }}>Agent 授權範圍</h3>
        <div className="rule-row"><span className="rid"><ShieldCheck size={18} /></span><span className="rn">自動送出金額上限<small>超過就攔下，轉給人</small></span><span className="rin">NT$<input inputMode="numeric" value={p.agentLimit.toLocaleString('en-US')} onChange={e => setP({ ...p, agentLimit: num(e.target.value) })} /></span></div>
        <Toggle k="agentProceed" label="可自動送往下一審核節點" desc="僅限建議通過且 6 項執行條件成立" />
        <Toggle k="agentRequestInfo" label="可自動通知補件" desc="寄出 CheckMate 擬好的補件通知" />
      </section>
    </div>
    <section className="card improve">
      <h3 className="sec"><Lightbulb size={18} />用決策資料改善規範</h3>
      <p className="muted">統計近 30 天被標示、又被財務人工確認通過的比例。覆寫率高的規則，可能代表規範需要調整。（模擬資料＋本次體驗的操作）</p>
      <div className="imp-rows">{stats.map(x => { const rate = Math.round(x.overridden / x.flagged * 100); const high = rate >= 50; return <div key={x.rule} className={high ? 'high' : ''}>
        <span className="rid">{x.rule}</span><span className="rn">{RULE_NAME[x.rule]}<small>標示 {x.flagged} 筆・人工確認通過 {x.overridden} 筆{x.extra ? `（含本次 ${x.extra} 筆）` : ''}{x.reasons.length ? `・常見說明：${x.reasons.join('、')}` : ''}</small></span>
        <span className="bar"><i style={{ width: `${rate}%` }} /></span><b>{rate}%</b>
        <span className="sug">{high && x.rule === 'P-01' ? <button onClick={() => setP({ ...p, limits: { ...p.limits, 住宿費: 3500 } })} disabled={p.limits['住宿費'] === 3500}>建議調為 NT$3,500</button> : <span className="muted">{high ? '建議檢視規則' : '維持現行規則'}</span>}</span>
      </div> })}</div>
    </section>
    <section className="card controls">
      <h3 className="sec">六道控制・降低誤判與漏判</h3>
      <div className="ctl-grid">{CONTROLS.map(c => <div key={c.name}><c.icon size={22} /><div><b>{c.name}</b><em>{c.en}</em><span>{c.d}</span></div></div>)}</div>
    </section>
    <div className={`save-bar${dirty ? ' on' : ''}`}>
      <span>{dirty ? '規範已修改，尚未生效' : `目前規範 v${state.policy.version}，Agent 自動送出上限 ${money(state.policy.agentLimit)}`}</span>
      {dirty && <button onClick={() => setP(state.policy)}>還原</button>}
      <button className="primary" disabled={!dirty} onClick={() => { dispatch({ type: 'policy', policy: p }); onSaved() }}><Save size={18} />儲存並重新審查待處理案件</button>
    </div>
  </div>
}
