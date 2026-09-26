# Design System

## 壹、Design Direction

**Modern Enterprise Review Workspace**

CheckMate 的介面應呈現專業、可信任、冷靜、高效率的企業級工作環境。

AI 是能力來源之一，但不應成為視覺主角。畫面應優先幫助使用者完成「審查、判斷、處置」。

## 貳、Design Principles

### 1. Review-first
優先回答：這筆需要我處理嗎？為什麼？下一步是什麼？

### 2. Risk-first
缺件、衝突、不確定與高風險訊號必須清楚可見。避免整頁使用紅／黃／綠造成視覺噪音。

### 3. Evidence before explanation
呈現順序：Finding → Evidence → Rule / Source → Reasoning。

不要用一大段 AI 說明取代具體證據。

### 4. Progressive Disclosure
第一層顯示決策所需資訊，詳細證據、規則與推理可逐步展開。

### 5. Consistent Actions
PROCEED、REQUEST_INFO、ESCALATE、OVERRIDE 在不同畫面保持一致的名稱、位置邏輯、視覺層級與確認方式。

## 參、Information Hierarchy

案件 Detail 建議資訊順序：

1. Case Summary
2. Recommendation
3. Blocking / Risk Signals
4. Required Checks
5. Findings
6. Evidence
7. Workflow Action
8. Audit Timeline

## 肆、Layout

- Desktop-first：主要 Demo 以 1280–1440px 為優先。
- 採 8px spacing system。
- 常用間距：4 / 8 / 16 / 24 / 32 / 48px。
- 避免審查資訊橫跨整個螢幕；詳細 Evidence 可使用 Side Panel、Drawer 或 Secondary Column。

## 伍、Typography

建議層級：

- Page Title：24–28px / Semibold
- Section Title：18–20px / Semibold
- Card Title：16px / Semibold
- Body：14–16px / Regular
- Metadata：12–14px / Regular

避免過多字重與尺寸。數字、金額、日期與 Case ID 應具有良好掃讀性。

## 陸、Color

以中性色作為主要工作介面基底。

Semantic Color 僅用於 Success、Warning、Error、Information、Selected / Interactive。

原則：

- 不用顏色作為唯一資訊來源。
- Blocking Risk 與一般 Warning 要有明確層級差異。
- AI 產生內容不使用專屬「AI 紫色」。

## 柒、Core Components

優先建立並重複使用：

- App Shell / Navigation
- Case Table
- Status Badge
- Recommendation Card
- Finding Card
- Evidence Item
- Required Check
- Risk Signal
- Rule / Source Reference
- Action Bar
- Confirmation Dialog
- Side Panel / Drawer
- Audit Timeline
- Empty / Loading / Error State

## 捌、Action Hierarchy

主要動作必須反映目前真正可執行的下一步。

Override 或可能改變流程狀態的操作需要額外確認。

Action wording 使用明確動詞，能精準描述行為時避免只用 OK、Submit、Continue。

## 玖、Icon

- 使用一致 Icon Library，目前採 Lucide React。
- 不使用 Emoji 作為 UI Icon。
- Icon 不單獨承擔重要語意。
- Risk / Status Icon 搭配文字 Label。

## 拾、UX Writing

採台灣企業軟體常用語氣：簡潔、直接、專業、可操作，不誇大 AI 能力。

**建議**
> 缺少住宿發票，無法完成此項檢查。

**避免**
> AI 發現這筆案件似乎可能有一些問題，建議您再確認看看。

**建議**
> 已轉交人工審核。

**避免**
> 交給專業的人類同事處理吧！

## 拾壹、System States

### Loading
說明正在進行的工作，例如「正在比對憑證」。

### Empty
說明目前沒有資料的原因與下一步。

### Error
說明發生什麼、是否影響審查，以及使用者可以怎麼處理。

### Success
確認實際完成的動作，不使用空泛成功訊息。

## 拾貳、Accessibility

以 WCAG 2.2 AA 原則為目標：

- 足夠文字 Contrast
- Keyboard 可操作
- Focus State 清楚
- Form Element 有 Label
- Status 不只靠顏色
- Dialog / Drawer 正確管理焦點

## 拾參、Implementation Rules

- 優先建立共用 Design Token。
- 避免 Page-specific CSS 重複定義相同 Pattern。
- 不任意使用 Inline SVG，優先使用既定 Icon Library。
- 新增 Pattern 前先確認既有元件是否可延伸。
