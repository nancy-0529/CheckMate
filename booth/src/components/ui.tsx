import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import type { Receipt } from '../data'
import { money } from '../data'
import type { Recommendation } from '../engine'
import type { Status } from '../store'

export const TONE: Record<Recommendation, string> = { 建議通過: 'ok', 建議補件: 'warn', 建議人工審核: 'bad' }
export const STATUS_TONE: Record<Status, string> = { 待處理: 'muted', 待補件: 'warn', 已完成初審: 'ok', 已轉交: 'info' }

export function Badge({ value }: { value: Recommendation }) {
  return <span className={`badge t-${TONE[value]}`}>{value}</span>
}
export function StatusChip({ value }: { value: Status }) {
  return <span className={`status s-${STATUS_TONE[value]}`}>{value}</span>
}

export function Modal({ title, onClose, children, wide }: { title: ReactNode; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const d = ref.current; d?.showModal(); return () => d?.close() }, [])
  return <dialog ref={ref} className={wide ? 'wide' : ''} onCancel={e => { e.preventDefault(); onClose() }}>
    <div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="關閉"><X size={20} /></button></div>
    {children}
  </dialog>
}

export type Highlight = 'vendor' | 'date' | 'city' | 'amount' | 'taxId'
export function ReceiptView({ receipt, highlight = [], scanning = false, compact = false }: { receipt: Receipt; highlight?: Highlight[]; scanning?: boolean; compact?: boolean }) {
  const hl = (k: Highlight) => highlight.includes(k) ? ' hl' : ''
  return <div className={`paper${compact ? ' compact' : ''}`}>
    <div className="p-tag">展示用模擬憑證・非真實交易</div>
    <div className={`p-vendor${hl('vendor')}`}>{receipt.vendor}</div>
    <div className="p-title">{receipt.title}</div>
    <div className="p-rows">
      <div><span>憑證編號</span><span>{receipt.id}</span></div>
      <div className={hl('date')}><span>消費日期</span><span>{receipt.date}</span></div>
      <div className={hl('city')}><span>消費地點</span><span>{receipt.city ?? '—'}</span></div>
      {receipt.lines.map(([k, v]) => <div key={k}><span>{k}</span><span>{v}</span></div>)}
      <div className={hl('taxId')}><span>統一編號</span><span>{receipt.taxId ? '12345678（示範值）' : '—'}</span></div>
    </div>
    <div className={`p-total${hl('amount')}`}><span>合計新台幣</span><b className={receipt.amount === undefined ? 'blurred' : ''}>{receipt.amount === undefined ? 'NT$1,8?0' : money(receipt.amount)}</b></div>
    {scanning && <div className="scanline" />}
  </div>
}
