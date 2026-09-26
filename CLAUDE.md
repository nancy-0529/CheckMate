# CLAUDE.md

本文件定義 AI 協作者在 CheckMate Repo 中的基本工作規則。目標是維持產品方向一致，同時保留快速迭代空間。

## 1. 工作前先讀

依任務需要閱讀以下文件：

1. README.md：專案入口與整體脈絡
2. docs/product/original-challenge.md：原始命題與限制
3. docs/product/product-discovery.md：問題理解、證據與待驗證假設
4. docs/product/product-brief.md：產品方向與核心原則
5. docs/product/product-scope.md：目前版本範圍
6. docs/design/：視覺與互動規範
7. specs/：已收斂功能的行為規格

不要只依既有程式碼推測產品需求。

## 2. 文件優先順序

發生衝突時：

- 原始命題決定不可違反的外部限制。
- Product Brief 決定產品方向。
- Product Scope 決定目前版本要做與不做什麼。
- specs/ 決定已收斂功能的具體行為。
- Design System 與 Interaction Patterns 決定介面與互動一致性。
- 既有程式碼是實作結果，不是需求來源。

若文件彼此衝突，不要自行選擇答案；先指出衝突與影響。

## 3. 產品不可偏離的原則

- CheckMate 是 AI Expense Review & Control Agent，不是完整費用管理系統。
- 審查建議固定為：建議通過、建議補件、建議人工審核。
- Recommendation 與 Workflow Action 必須分開。
- Agent 只能在必要檢查完成、證據充分、規則明確、無阻擋風險、無未解決衝突且位於企業授權範圍內時自動執行。
- 資料不足、不確定、高風險或超出授權範圍時，必須轉補件或人工處理。
- 不執行最終核准、正式會計入帳、自動付款、正式稅務申報或最終法律判定。
- Demo 僅使用模擬資料。

## 4. 開發方式

### Skill Discipline

開始任何新產品行為（新 User Story／Product Slice）或除錯任務前，
先確認 Superpowers 流程 skill（如 brainstorming、systematic-debugging）是否適用，
不得因為需求或問題描述已經很清楚而跳過檢查。

產品功能以可獨立驗收的 **User Story / Product Slice** 作為主要開發單位。

已收斂的非瑣碎產品行為，依以下流程進行：

```text
Product Direction
→ User Story / Product Slice
→ Spec + Acceptance Criteria
→ Test Strategy
→ Implementation
→ Verification
```

### Spec-Driven Development

- 尚未收斂的 UI、Interaction、資訊架構或文案，可以先用介面與 Mock Data 快速驗證，不強制先建立正式 Spec。
- 當功能行為已收斂且需要穩定實作時，再建立或更新 specs/。
- Spec 至少要包含 User Story / 使用情境、行為定義、Acceptance Criteria 與重要例外情境。
- 實作不得自行加入 Spec 沒有定義的新狀態、流程或產品決策。
- 若發現值得做但不屬於目前 Scope 的功能，不順手實作。

### Test-Driven Development

- 可自動驗證的核心領域邏輯與 Bug Fix 優先採 Test-first。
- 能由 Acceptance Criteria 直接轉成自動測試的行為，優先先定義測試再實作。
- 純視覺調整、探索中的 Interaction 與一次性 Demo 細節，不要求形式化 TDD。
- 測試失敗時，不為了讓測試通過而修改正確的 Acceptance Criteria。
- 若 Spec、Test 與實作互相衝突，先回到產品規則釐清。

目前不使用 OpenSpec。不要建立 openspec/、Change Proposal、Archive 或相關流程，除非後續明確決定導入。

## 5. 目前開發原則

目前階段優先順序：

1. 核心審查流程清楚且可操作
2. Demo 情境完整
3. 資訊架構與互動一致
4. 核心產品行為可驗證
5. 再考慮工程完整度

避免為尚未確認的需求建立過度抽象、過度泛化或 production-grade 的基礎設施。

Bug Fix、Refactor、Chore、Spike 等非產品功能變更可以獨立處理，不需要硬包成 User Story，但仍需有清楚範圍與驗證方式。

## 6. UI 與 UX

- 專業、可信任、冷靜、清楚。
- Review-first、Risk-first、Evidence-first。
- 先呈現結論與需要使用者處理的事項，再逐步展開細節。
- 不使用 Emoji 作為 UI icon。
- 使用一致的 icon system。
- UX Writing 採台灣常用、直接、可操作的用語。
- 不使用模糊或擬人化的 AI 文案掩蓋系統實際行為。
- 不自行發明新的 Status、Recommendation、Action wording 或 Icon 語意。
- 不只靠顏色傳達重要狀態。

## 7. 規格與實作邊界

新的功能在流程與行為尚未收斂前，可以先於介面與 Mock Data 中驗證。

當功能已收斂並需要成為穩定行為時，再補進 specs/。

實作時：

- 不因「未來可能會用」提前加入未進 Scope 的功能、套件或基礎設施。
- 不為了配合既有 Code 而改寫已定案的產品規則。
- 不把 Mock Data 或 Demo 邏輯包裝成已完成的 Production 能力。
- 發現需求超出 Product Scope、需要新增產品流程或自動化權限時，先提出再實作。

## 8. PRD Review Criteria

撰寫或修改 User Story、User Flow、Edge Case、PRD、Feature Spec、Acceptance Criteria 時，須依 `docs/product/prd-review-criteria.md` 檢查，依文件所處階段套用不同嚴謹度：

- **探索／全局骨架階段**（例如 User Flow、Edge Case Map 等尚未收斂的文件）：Criteria 用來幫助思考與避免遺漏，不要求每個不適用項目都形式化標示 N/A。若某項明顯不屬於當前文件層級，可不展開，但不能因此掩蓋真正未決的產品問題。
- **Feature Spec／Acceptance Criteria 階段**：需逐項套用 Criteria；不適用項目應標示 N/A 並簡要說明原因，不可直接忽略。
- 檢查須在撰寫階段主動進行，不是只在文件完成後才回頭 Review。
- Criteria 是品質檢查標準，不代表每份文件都要承載所有細節；內容應放在正確的文件層級（例如 User Flow 不需要涵蓋效能門檻，那屬於 Feature Spec／Acceptance Criteria 層級）。
