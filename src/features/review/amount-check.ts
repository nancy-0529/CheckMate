export type AmountResult = {
  status: '一致' | '不一致' | '缺憑證' | '無法判斷'
  reason: string
  applicationCents?: number
  evidenceCents?: number
  differenceCents?: number
  rule: 'E-01 v1'
}
function cents(raw: string): number | undefined {
  const value = raw.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return undefined
  const [whole, fraction = ''] = value.split('.')
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return Number.isSafeInteger(result) ? result : undefined
}
export function checkAmount(application: string, attached: boolean, evidence: string): AmountResult {
  const applicationCents = cents(application)
  const base = { rule: 'E-01 v1' as const, applicationCents }
  if (applicationCents === undefined) return { ...base, status: '無法判斷', reason: '申請金額須為非負數，最多兩位小數，且不得超出可處理範圍。' }
  if (!attached) return { ...base, status: '缺憑證', reason: '未附憑證，請補充後再核對金額。' }
  const evidenceCents = cents(evidence)
  if (evidenceCents === undefined) return { ...base, status: '無法判斷', reason: '憑證總額未填或格式無效，請確認憑證金額。' }
  const differenceCents = applicationCents - evidenceCents
  return { ...base, evidenceCents, differenceCents, status: differenceCents === 0 ? '一致' : '不一致', reason: differenceCents === 0 ? '本項金額一致；尚未執行企業規範、憑證格式與重複申報檢查。' : '金額有差異，需由財務人員確認原因。' }
}
