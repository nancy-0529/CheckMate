# CheckMate

> **AI Expense Review & Control Agent for corporate expense review.**

CheckMate 是企業費用審查中的代理式（Agentic）服務，協助完成大量重複性的初步檢查、辨識風險與整理判斷依據，並在企業授權與控制機制下執行可安全自動化的處置，讓財務人員專注在真正需要專業判斷的案件。

---

## 壹、核心亮點

### 1. 代理式審查
CheckMate 不只判斷「建議通過／建議補件／建議人工審核」，也能在授權範圍內接手後續例行工作，例如通知補件、轉交人工、推進流程與留下處理紀錄，降低財務人員在重複性操作上的負擔。

### 2. 找出規則之外的風險
除了企業規範與欄位比對，CheckMate 也可進一步辨識：

- 合理性（Reasonableness）
- 憑證真偽風險（Authenticity）
- 歷史異常
- 重複申報／疑似拆單
- 跨系統風險訊號

讓審查不只停留在「有沒有違反規則」，也能看見需要進一步判斷的異常情境。

### 3. 用決策資料持續改善制度
每次 Agent 判斷、人工覆寫、最終處置與結果都可留下決策資料，作為後續檢視企業規範、審查流程與自動化邊界的依據，讓制度能隨實際案例持續優化。

### 4. 低門檻快速導入
CheckMate 可疊加在既有 ERP、BPM、費用管理或會計流程之上，透過檔案上傳、批次審查或 API 串接逐步導入，不必先汰換原有系統，也能開始導入 AI 初審與風險控管能力。

---

## 貳、如何運作

```text
費用申請／單據
→ 擷取與整理資料
→ 比對申請與憑證
→ 檢查企業規範／法規
→ 辨識異常與風險
→ 產生審查建議
→ 自動處置或轉人工
→ 留下完整決策紀錄
```

CheckMate 提供三種審查建議：

- **建議通過**
- **建議補件**
- **建議人工審核**

審查建議與實際流程動作分開；只有在符合控制條件與企業授權時，Agent 才能自動執行。

---

## 參、如何控制 AI 自動化風險

CheckMate 不以模型判斷本身作為自動執行依據，而是透過明確控制機制決定 Agent 是否可以採取行動。

```text
必要檢查完成
＋ 證據充分
＋ 規則結果明確
＋ 無阻擋風險
＋ 無未解決衝突
＋ 位於企業授權範圍
＝ 才能自動執行
```

資料不足、規則衝突、高風險或超出授權範圍時，案件一律轉為補件或人工處理；所有 Agent 與人工決策皆保留可追溯紀錄。

---

## 肆、主要使用情境

目前示範案例涵蓋：

- 正常案件
- 重複申報
- 超出費用上限
- 缺少必要附件
- 申請金額與單據金額不一致

可延伸至：

- 憑證真偽風險
- 合理性判斷
- 台灣法規檢核
- 歷史異常辨識
- 跨案件與跨系統風險判斷

---

## 伍、產品邊界

CheckMate 聚焦於**費用初審、風險辨識與受控處置**，不是完整的費用管理系統。

目前不執行：

- 最終核准
- 正式會計入帳
- 自動付款
- 正式稅務申報
- 最終稅務認定
- 舞弊或偽造的最終法律判定

所有示範與測試資料皆為模擬資料。

---

## 陸、技術選型

| 類別 | 技術 |
|---|---|
| 前端 | React + TypeScript + Vite |
| 路由 | React Router |
| 圖示 | Lucide React |
| 資料 | Mock Data / Fixtures |

目前優先驗證產品流程、資訊架構與互動；正式後端、資料庫、權限與企業系統整合於後續工程化階段處理。

---

## 柒、快速開始

### 環境需求

- Node.js
- npm 或 pnpm

### 安裝與啟動

```bash
npm install
npm run dev
```

或：

```bash
pnpm install
pnpm dev
```

啟動成功後，依終端機顯示的本機網址開啟瀏覽器。

---

## 捌、專案結構

```text
/
├── README.md
├── CLAUDE.md
│
├── docs/
│   ├── product/
│   │   ├── original-challenge.md
│   │   ├── product-discovery.md
│   │   ├── product-brief.md
│   │   └── product-scope.md
│   │
│   └── design/
│       ├── design-system.md
│       └── interaction-patterns.md
│
├── specs/
│   └── <定案後的 user story>.md
│
├── src/
│   ├── components/
│   ├── features/
│   ├── data/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
└── vite.config.ts
```

---

## 玖、文件

| 文件 | 用途 |
|---|---|
| `docs/product/original-challenge.md` | 原始命題、限制與最低交付要求 |
| `docs/product/product-discovery.md` | 市場證據、問題理解與產品假設 |
| `docs/product/product-brief.md` | 定案的產品方向、核心價值與產品原則 |
| `docs/product/product-scope.md` | 本次版本的範圍、優先級與邊界 |
| `docs/design/design-system.md` | 視覺、元件與 UX Writing 原則 |
| `docs/design/interaction-patterns.md` | 共用操作流程與互動規則 |
| `specs/` | 已收斂 User Story / Feature 的行為規格與驗收條件 |
| `CLAUDE.md` | AI 協作時的核心規則 |

`README.md` 作為專案入口；詳細產品背景、設計與行為規格以對應文件為準。

---

<sub>CheckMate｜2026 AI Practitioner Program・第 5 組</sub>
