export type Receipt = {
  id: string; vendor: string; title: string; date: string; city?: string
  amount?: number; taxId: boolean; layoutMismatch?: boolean
  lines: [string, string][]
}
export type ExpenseCase = {
  id: string; applicant: string; dept: string; category: string; title: string
  amount: number; date: string; purpose: string; tripCity?: string
  receipt?: Receipt; source: 'preset' | 'upload'; channel?: Channel; applicantNote?: string
}
export type Channel = '費用系統 API' | '批次檔' | '企業卡'
export type HistoryCase = { id: string; applicant: string; vendor: string; amount: number; date: string }

export type Policy = {
  version: number
  limits: Record<string, number>
  taxIdThreshold: number
  duplicate: boolean; context: boolean; authenticity: boolean
  agentLimit: number; agentProceed: boolean; agentRequestInfo: boolean
}

export const RULE_IDS: Record<string, string> = { 住宿費: 'P-01', 交通費: 'P-03', 餐費: 'P-04', 軟體授權: 'P-05' }
export const LIMIT_UNIT: Record<string, string> = { 住宿費: '每晚', 交通費: '每筆', 餐費: '每筆', 軟體授權: '每筆' }

export const DEFAULT_POLICY: Policy = {
  version: 1,
  limits: { 住宿費: 3000, 交通費: 2000, 餐費: 3000, 軟體授權: 60000 },
  taxIdThreshold: 3000,
  duplicate: true, context: true, authenticity: true,
  agentLimit: 20000, agentProceed: true, agentRequestInfo: true,
}

export const HISTORY: HistoryCase[] = [
  { id: 'EXP-2026-018', applicant: '李承恩', vendor: '城際鐵路（模擬）', amount: 1490, date: '2026-09-18' },
  { id: 'EXP-2026-021', applicant: '陳怡安', vendor: '晴川商旅（模擬）', amount: 2600, date: '2026-08-22' },
]

const r = (id: string, vendor: string, title: string, amount: number | undefined, city: string, extra: Partial<Receipt> = {}): Receipt =>
  ({ id, vendor, title, amount, city, date: '2026-09-18', taxId: true, lines: [], ...extra })

export const PRESET_CASES: ExpenseCase[] = [
  { id: 'EXP-2026-001', applicant: '陳怡安', dept: '業務部', category: '住宿費', title: '台中客戶拜訪住宿', amount: 2400, date: '2026-09-18', purpose: '台中客戶年度拜訪，住宿一晚。', tripCity: '台中', source: 'preset', channel: '費用系統 API',
    receipt: r('EV-001', '晴川商旅（模擬）', '住宿收據', 2400, '台中', { lines: [['房型', '標準單人房 1 晚']] }) },
  { id: 'EXP-2026-002', applicant: '林子晴', dept: '行銷部', category: '住宿費', title: '高雄展會支援住宿', amount: 2800, date: '2026-09-18', purpose: '高雄展會現場支援，住宿一晚。', tripCity: '高雄', source: 'preset' },
  { id: 'EXP-2026-003', applicant: '王柏翰', dept: '產品部', category: '交通費', title: '新竹供應商會議交通', amount: 1680, date: '2026-09-18', purpose: '新竹供應商會議，往返交通。', tripCity: '新竹', source: 'preset', channel: '費用系統 API',
    receipt: r('EV-003', '城際客運（模擬）', '交通費收據', 1480, '新竹', { lines: [['品項', '新竹往返']] }) },
  { id: 'EXP-2026-004', applicant: '張雅婷', dept: '業務部', category: '住宿費', title: '台南客戶專案訪談住宿', amount: 4200, date: '2026-09-18', purpose: '台南客戶專案訪談，住宿一晚。', tripCity: '台南', source: 'preset', channel: '費用系統 API',
    receipt: r('EV-004', '南方旅店（模擬）', '住宿收據', 4200, '台南', { lines: [['房型', '標準雙人房 1 晚']] }) },
  { id: 'EXP-2026-005', applicant: '李承恩', dept: '設計部', category: '交通費', title: '台中設計工作坊交通', amount: 1490, date: '2026-09-18', purpose: '台中設計工作坊，出差交通。', tripCity: '台中', source: 'preset', channel: '費用系統 API',
    receipt: r('EV-005', '城際鐵路（模擬）', '車票收據', 1490, '台中', { lines: [['區間', '台北－台中']] }) },
  { id: 'EXP-2026-007', applicant: '周宇辰', dept: '研發部', category: '其他：研究材料', title: '研究專案材料採購', amount: 1800, date: '2026-09-18', purpose: '研究專案材料採購。', source: 'preset', channel: '批次檔',
    receipt: r('EV-007', '創研材料（模擬）', '銷貨收據', 1800, '台北', { lines: [['品項', '實驗耗材']] }) },
  { id: 'EXP-2026-009', applicant: '許家瑜', dept: '行政部', category: '住宿費', title: '台北教育訓練住宿', amount: 1200, date: '2026-09-18', purpose: '台北教育訓練，住宿一晚。', tripCity: '台北', source: 'preset', channel: '批次檔',
    receipt: r('EV-009', '晴川商旅（模擬）', '住宿收據', 1200, '台北', { lines: [['房型', '標準單人房 1 晚']] }) },
  { id: 'EXP-2026-011', applicant: '蔡秉修', dept: '業務部', category: '交通費', title: '新竹供應商年度會議交通', amount: 680, date: '2026-09-18', purpose: '新竹供應商年度會議，會後交通。', tripCity: '新竹', source: 'preset', channel: '費用系統 API',
    receipt: r('EV-011', '高雄站前客運（模擬）', '交通費收據', 680, '高雄', { lines: [['品項', '市區交通']] }) },
  { id: 'EXP-2026-012', applicant: '黃詩涵', dept: '業務部', category: '餐費', title: '港都客戶餐敘', amount: 2960, date: '2026-09-18', purpose: '高雄客戶餐敘。', tripCity: '高雄', source: 'preset', channel: '企業卡',
    receipt: r('EV-012', '港都餐飲（模擬）', '餐費收據', 2960, '高雄', { layoutMismatch: true, lines: [['品項', '客戶餐敘 4 位']] }) },
  { id: 'EXP-2026-015', applicant: '吳冠廷', dept: '資訊部', category: '軟體授權', title: '年度軟體授權', amount: 48000, date: '2026-09-18', purpose: '設計協作軟體年度授權續約。', source: 'preset', channel: '企業卡',
    receipt: r('EV-015', '雲端軟體（模擬）', '電子發票', 48000, '台北', { lines: [['品項', '年度授權 20 席']] }) },
  { id: 'EXP-2026-013', applicant: '鄭又嘉', dept: '業務部', category: '餐費', title: '台北客戶餐敘（午）', amount: 2700, date: '2026-09-19', purpose: '台北客戶午餐會議。', tripCity: '台北', source: 'preset', channel: '費用系統 API',
    receipt: r('EV-013', '福園餐廳（模擬）', '餐費收據', 2700, '台北', { date: '2026-09-19', lines: [['品項', '商務午餐 4 位']] }) },
  { id: 'EXP-2026-014', applicant: '鄭又嘉', dept: '業務部', category: '餐費', title: '台北客戶餐敘（晚）', amount: 2400, date: '2026-09-19', purpose: '台北客戶晚餐會議。', tripCity: '台北', source: 'preset', channel: '費用系統 API',
    receipt: r('EV-014', '福園餐廳（模擬）', '餐費收據', 2400, '台北', { date: '2026-09-19', lines: [['品項', '商務晚餐 4 位']] }) },
]

/* 申請人補件時可附上的憑證（模擬） */
export const SUPPLEMENTS: Record<string, Receipt> = {
  'EXP-2026-002': { id: 'EV-002', vendor: '港灣商旅（模擬）', title: '住宿收據', date: '2026-09-18', city: '高雄', amount: 2800, taxId: true, lines: [['房型', '標準單人房 1 晚']] },
}

/* 過去 30 天的人工決策紀錄（模擬），用於規範改善建議 */
export const PAST_DECISIONS: { rule: string; flagged: number; overridden: number; reasons: string[] }[] = [
  { rule: 'P-01', flagged: 9, overridden: 7, reasons: ['展會期間房價上漲', '主管已核准'] },
  { rule: 'X-01', flagged: 5, overridden: 1, reasons: ['行程臨時異動'] },
  { rule: 'R-01', flagged: 4, overridden: 0, reasons: [] },
]

export type Sample = { key: string; label: string; hint: string; form: Omit<ExpenseCase, 'id' | 'receipt' | 'source'>; receipt: Receipt }
export const SAMPLES: Sample[] = [
  { key: 'taxi', label: '台北計程車收據', hint: '一般案件',
    form: { applicant: '謝宛庭', dept: '業務部', category: '交通費', title: '台北客戶拜訪交通', amount: 460, date: '2026-09-25', purpose: '台北客戶拜訪，往返計程車。', tripCity: '台北' },
    receipt: { id: 'EV-101', vendor: '台灣大車隊（模擬）', title: '乘車收據', date: '2026-09-25', city: '台北', amount: 460, taxId: true, lines: [['上車', '信義區'], ['下車', '內湖區']] } },
  { key: 'hotel', label: '台中飯店收據', hint: '可能超出規範',
    form: { applicant: '陳柏宇', dept: '產品部', category: '住宿費', title: '台中使用者訪談住宿', amount: 3600, date: '2026-09-24', purpose: '台中使用者訪談，住宿一晚。', tripCity: '台中' },
    receipt: { id: 'EV-102', vendor: '綠園酒店（模擬）', title: '住宿收據', date: '2026-09-24', city: '台中', amount: 3600, taxId: true, lines: [['房型', '豪華單人房 1 晚']] } },
  { key: 'blur', label: '模糊的餐廳收據', hint: '看不清楚時會怎樣？',
    form: { applicant: '林品妤', dept: '行銷部', category: '餐費', title: '台北媒體餐敘', amount: 1850, date: '2026-09-23', purpose: '台北媒體餐敘。', tripCity: '台北' },
    receipt: { id: 'EV-103', vendor: '小巷食堂（模擬）', title: '餐費收據', date: '2026-09-23', city: '台北', amount: undefined, taxId: false, lines: [['品項', '餐敘 3 位']] } },
]

export const money = (n: number) => `NT$${n.toLocaleString('en-US')}`
