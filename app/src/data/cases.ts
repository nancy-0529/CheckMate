export type Recommendation = '建議通過' | '建議補件' | '建議人工審核'
export const dimensions = ['佐證比對', '企業規範', '台灣法規遵循', '基礎風險訊號'] as const
export const dimensionLabels: Record<typeof dimensions[number], string> = { '佐證比對': '申請與憑證核對', '企業規範': '企業規範', '台灣法規遵循': '憑證格式（示範規則）', '基礎風險訊號': '異常檢查' }
export type Dimension = typeof dimensions[number]
export type Finding = {
  id: string
  title: string
  dimension: Dimension
  kind: '缺漏' | '異常' | '無法判斷'
  explanation: string
  rule: string
  comparison: [string, string][]
  evidence?: boolean
  related?: boolean
}
export type Evidence = { id: string; vendor: string; amount: number; date: string; taxId: boolean }
export type Review = {
  id: string
  time: string
  recommendation: Recommendation
  findings: Finding[]
  checks: string[]
  evidence: Evidence[]
}
export type ExpenseLine = { id: string; category: string; description: string; date: string; amount: number; evidenceIds: string[]; netAmount?: number; taxAmount?: number }
export type ExpenseCase = {
  employeeId?: string; paymentMethod?: string; summary?: string; submittedAt?: string; lines?: ExpenseLine[]
  id: string; applicant: string; department: string; category: string; amount: number
  date: string; description: string; scenario: string; reviews: Review[]
}

const receipt = (id: string, vendor: string, amount: number, taxId = true): Evidence => ({ id, vendor, amount, date: '2026-09-18', taxId })
const missing: Finding = {
  id: 'missing-receipt', title: '缺少必要的住宿憑證', dimension: '佐證比對', kind: '缺漏',
  explanation: '申請資料中沒有住宿憑證，尚無法核對實際支出金額。',
  rule: '模擬企業規範 P-02｜住宿費須檢附住宿憑證。', comparison: [['必要附件', '住宿憑證'], ['目前附件', '0 份']],
}
const normalChecks = ['申請與憑證金額一致', '金額符合此類別示範上限', '不適用：申請金額未達 NT$3,000 示範門檻，未執行憑證格式檢查。', '示範比對資料中未發現重複訊號']
function review(id: string, recommendation: Recommendation, findings: Finding[], evidence: Evidence[], checks = normalChecks): Review {
  return { id, time: '2026-09-21 09:30', recommendation, findings, evidence, checks }
}
export const cases: ExpenseCase[] = [
  {
    id: 'EXP-2026-001', applicant: '陳怡安', department: '業務部', category: '住宿費', amount: 2400,
    date: '2026-09-18', description: '台中客戶拜訪，出差住宿一晚。', scenario: '正常案件・曾重新審查',
    reviews: [
      { ...review('REV-001-1', '建議補件', [missing], [], ['缺少住宿憑證，無法核對金額', '申請金額符合住宿費上限 NT$3,000', '不適用：申請金額未達示範格式檢查門檻', '示範比對資料中未發現重複訊號']), time: '2026-09-20 15:10' },
      review('REV-001-2', '建議通過', [], [receipt('EV-001', '晴川商旅（模擬）', 2400)], [normalChecks[0], 'P-01｜住宿費 NT$2,400，未超過每晚 NT$3,000 上限', normalChecks[2], normalChecks[3]]),
    ],
  },
  {
    id: 'EXP-2026-002', applicant: '林子晴', department: '行銷部', category: '住宿費', amount: 2800,
    date: '2026-09-18', description: '高雄展會支援，出差住宿一晚。', scenario: '缺少必要附件',
    reviews: [review('REV-002-1', '建議補件', [missing], [], ['缺少住宿憑證，無法核對金額', '申請金額符合住宿費上限 NT$3,000', '不適用：申請金額未達示範格式檢查門檻', '示範比對資料中未發現重複訊號'])],
  },
  {
    id: 'EXP-2026-003', applicant: '王柏翰', department: '產品部', category: '交通費', amount: 1680,
    date: '2026-09-18', description: '新竹供應商會議，往返交通費。', scenario: '申請與憑證金額不一致',
    reviews: [review('REV-003-1', '建議人工審核', [{ id: 'amount-mismatch', title: '申請金額比憑證多 NT$200', dimension: '佐證比對', kind: '異常', explanation: '申請為 NT$1,680，憑證為 NT$1,480。金額不一致，需由人工確認差異原因。', rule: '模擬比對規則 E-01｜申請金額須與憑證金額一致；本階段不設容許誤差。', comparison: [['申請金額', 'NT$1,680'], ['憑證金額', 'NT$1,480'], ['差額', 'NT$200']], evidence: true }], [receipt('EV-003', '城際客運（模擬）', 1480)])],
  },
  {
    id: 'EXP-2026-004', applicant: '張雅婷', department: '業務部', category: '住宿費', amount: 4200,
    date: '2026-09-18', description: '台南客戶專案訪談，出差住宿一晚。', scenario: '超出企業費用上限',
    reviews: [review('REV-004-1', '建議人工審核', [{ id: 'policy-limit', title: '住宿費超出示範上限 NT$1,200', dimension: '企業規範', kind: '異常', explanation: '本次一晚住宿費 NT$4,200，超出每晚 NT$3,000 的企業示範上限。', rule: '模擬企業規範 P-01｜國內住宿費每晚以 NT$3,000 為上限。', comparison: [['本次住宿費', 'NT$4,200／晚'], ['企業示範上限', 'NT$3,000／晚']], evidence: true }], [receipt('EV-004', '南方旅店（模擬）', 4200)], ['申請與憑證金額一致', '住宿費超出示範上限', '已核對示範統一編號欄位，格式完整', '示範比對資料中未發現重複訊號'])],
  },
  {
    id: 'EXP-2026-005', applicant: '李承恩', department: '設計部', category: '交通費', amount: 1490,
    date: '2026-09-18', description: '台中設計工作坊，出差交通費。', scenario: '疑似重複申報',
    reviews: [review('REV-005-1', '建議人工審核', [{ id: 'duplicate', title: '與既有案件 EXP-2026-018 疑似重複', dimension: '基礎風險訊號', kind: '異常', explanation: '申請人、供應商、金額與費用日期皆相同。這是待確認的風險訊號，不代表已認定重複申報。', rule: '模擬風險規則 R-01｜比對申請人、供應商、金額與日期，標示相同的既有案件。', comparison: [['申請人', '兩案皆為李承恩'], ['供應商', '兩案皆為城際鐵路（模擬）'], ['金額／日期', '兩案皆為 NT$1,490／2026-09-18']], evidence: true, related: true }], [receipt('EV-005', '城際鐵路（模擬）', 1490)])],
  },
  {
    id: 'EXP-2026-006', applicant: '許家瑜', department: '行政部', category: '辦公用品', amount: 3600,
    date: '2026-09-18', description: '辦公室文具及耗材採購。', scenario: '憑證格式不完整',
    reviews: [review('REV-006-1', '建議人工審核', [{ id: 'receipt-format', title: '憑證缺少統一編號欄位', dimension: '台灣法規遵循', kind: '異常', explanation: '申請金額達到示範門檻，憑證未具備示範規則要求的統一編號欄位，需人工確認格式。', rule: '示範格式規則 C-01｜金額達 NT$3,000 時檢查統一編號欄位。這是 Mock Policy，不代表真實法定門檻或稅務認定。', comparison: [['申請金額', 'NT$3,600'], ['示範門檻', 'NT$3,000'], ['統一編號欄位', '缺少']], evidence: true }], [receipt('EV-006', '日常文具（模擬）', 3600, false)], ['申請與憑證金額一致', '金額符合此類別示範上限', '憑證缺少統一編號欄位', '示範比對資料中未發現重複訊號'])],
  },
  {
    id: 'EXP-2026-007', applicant: '周宇辰', department: '研發部', category: '其他：研究材料', amount: 1800,
    date: '2026-09-18', description: '研究專案材料採購，費用類別尚未對應企業規範。', scenario: '系統無法判斷',
    reviews: [review('REV-007-1', '建議人工審核', [{ id: 'unknown-category', title: '此費用類別尚無對應規範，需人工確認', dimension: '企業規範', kind: '無法判斷', explanation: '系統無法將「其他：研究材料」對應到規範，沒有對此項作出符合或違規判斷。請人工直接查閱原始申請與佐證。', rule: '輸入邊界｜此 Prototype 的示範類別僅包含交通費、住宿費、辦公用品。', comparison: [['申請類別原始值', '其他：研究材料'], ['可套用的類別規範', '無法對應']], evidence: true }], [receipt('EV-007', '創研材料（模擬）', 1800)])],
  },
]
cases.push(
  {
    id: 'EXP-2026-008', applicant: '林子晴', department: '業務部', category: '差旅費', amount: 3280,
    date: '2026-09-18', submittedAt: '2026-09-21', summary: '台中客戶拜訪住宿及交通', description: '台中客戶年度合作會議，住宿一晚及隔日前往客戶公司之交通費。', scenario: '多筆費用缺少一份憑證',
    lines: [
      { id: 'L008-1', category: '住宿費', description: '晴川商旅住宿一晚', date: '2026-09-18', amount: 2800, evidenceIds: ['EV-008'] },
      { id: 'L008-2', category: '交通費', description: '飯店至客戶公司計程車', date: '2026-09-19', amount: 480, evidenceIds: [] },
    ],
    reviews: [review('REV-008-1', '建議補件', [{ ...missing, id: 'missing-transport', title: '交通費 NT$480 未附憑證', explanation: '住宿憑證已提供，交通費尚無對應憑證。', rule: '模擬企業規範 P-02｜住宿及交通費須檢附對應憑證。', comparison: [['缺少附件', '09/19 交通憑證'], ['申請金額', 'NT$480']] }], [receipt('EV-008', '晴川商旅（模擬）', 2800)], ['住宿金額一致；交通費缺憑證', '住宿費未超過每晚 NT$3,000 上限', '不適用：各筆費用未達示範格式檢查門檻', '比對資料中未發現重複訊號'])],
  },
)
// 展示用申請表資料；未提供的未稅／稅額不由總額反推。
const employeeIds: Record<string, string> = { '陳怡安': 'E-021', '林子晴': 'E-028', '王柏翰': 'E-032', '張雅婷': 'E-041', '李承恩': 'E-052', '許家瑜': 'E-063', '周宇辰': 'E-071' }
for (const item of cases) {
  item.employeeId = employeeIds[item.applicant]
  item.submittedAt ??= '2026-09-21'
  item.paymentMethod = item.id === 'EXP-2026-006' ? '公司公務卡' : '員工代墊／個人信用卡'
}
export function expenseLines(item: ExpenseCase): ExpenseLine[] {
  return item.lines ?? [{ id: item.id, category: item.category, description: item.description, date: item.date, amount: item.amount, evidenceIds: [...new Set(item.reviews.flatMap(r => r.evidence.map(e => e.id)))] }]
}
export const caseSummary = (item: ExpenseCase) => item.summary ?? item.description.replace(/[，。]/g, '')
export const money = (amount: number) => `NT$${amount.toLocaleString('en-US')}`
