# Product Scope

> 本文件定義目前版本要做、暫不做與只作為後續方向的能力。Product Brief 決定方向；Product Scope 決定這次做到哪裡。

## 壹、P0｜Demo 必須成立

### 1. Input & Extraction
- 支援模擬費用申請與單據資料
- 呈現關鍵欄位與來源
- 可識別缺漏資訊

### 2. Evidence Matching
- 比對申請與憑證
- 顯示一致、不一致與缺失項目
- Finding 可追溯至 Evidence

### 3. Corporate Policy Review
以 5–8 條 Mock Policy 展示金額上限、必要附件、可報支類別、期間／日期條件等 deterministic rule。

### 4. Taiwan Compliance
選擇 1–2 條具代表性且可明確判斷的台灣規則，展示規則來源、適用條件、Required Facts、Required Evidence 與判斷結果。

無法明確判斷時轉人工。不建立完整台灣法規知識庫。

### 5. Risk Signals
至少可呈現部分：

- 合理性風險
- 重複申報
- 疑似拆單
- 憑證真偽風險訊號
- 歷史異常

進階風險可使用 Mock Signal 模擬，不宣稱已具備 production-grade detection。

### 6. Recommendation
僅有三種：

- 建議通過
- 建議補件
- 建議人工審核

每項 Recommendation 都要清楚呈現主要理由。

### 7. Workflow Action
Recommendation 與 Action 分離：

- PROCEED
- REQUEST_INFO
- ESCALATE
- OVERRIDE

Demo 中需讓使用者看見 Agent「不只判斷，也能完成後續處置」。

### 8. Control Mechanism
至少展示：

- Required Checks
- Hard Guardrails
- Evidence Chain
- Independent Verification 的概念

不符合自動執行條件時，不得直接 Proceed。

### 9. Audit Trail
保留：

- Agent Finding
- Recommendation
- Action
- Human Override
- 時間與處理狀態

### 10. Demo Cases
至少 5–10 筆 Mock Cases，涵蓋：

- 正常案件
- 重複申報
- 超出費用上限
- 缺少必要附件
- 金額不一致

可額外加入 Reasonableness、Authenticity、Taiwan Compliance 等情境。

## 貳、P1｜核心流程成立後再補

- Policy Management UI
- Compliance Rule Management UI
- Batch / Shadow Audit
- Dashboard / Summary
- Case Search / Filter
- Rule Version 顯示
- 基本審查統計
- 更完整的 Audit / Decision History

P1 不應阻塞核心 Demo Flow。

## 參、Concept｜後續方向

- Pre-submit Validation
- Continuous Optimization
- Advanced Risk Intelligence
- Enterprise Integration
- Multi-jurisdiction Compliance

## 肆、Out of Scope

目前不做：

- 完整費用申請 Portal
- 完整員工補件對話流程
- 最終核准
- 正式會計入帳
- 自動付款
- 正式稅務申報
- 完整台灣法規知識庫
- 多國法規完整支援
- 真實企業系統正式串接
- Production Auth / RBAC
- Production-grade Security / Privacy / Data Retention
- 完整 Observability / Retry / Idempotency
- 真實 OCR／LLM Pipeline 的 Productionization

## 伍、Demo Happy Path

正常案件 → 開啟案件 → 查看 Agent 審查結果 → 查看 Findings / Evidence → 確認必要檢查完成 → 建議通過 → PROCEED → 留下處理紀錄

## 陸、Demo Exception Paths

### 缺件
缺少必要證據 → 建議補件 → REQUEST_INFO → 留下通知與處理紀錄

### 高風險／不確定
偵測異常或無法安全判斷 → 建議人工審核 → ESCALATE → 交由財務人員處理

### 人工覆寫
財務人員不同意 Agent 結果 → OVERRIDE → 記錄原因 → 保留 Human Decision

## 柒、完成條件

本版本完成時，評審或測試者應能清楚回答：

1. CheckMate 審了什麼？
2. 為什麼得出這個結果？
3. 哪些案件可以由 Agent 繼續處理？
4. 哪些案件一定會被攔下來交給人？
5. Agent 執行了什麼後續動作？
6. 人類如何覆寫與追溯決策？
