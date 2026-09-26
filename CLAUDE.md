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

## 4. 目前開發原則

目前階段優先順序：

1. 核心審查流程清楚且可操作
2. Demo 情境完整
3. 資訊架構與互動一致
4. 再考慮工程完整度

避免為尚未確認的需求建立過度抽象、過度泛化或 production-grade 的基礎設施。

## 5. UI 與 UX

- 專業、可信任、冷靜、清楚。
- Review-first、Risk-first、Evidence-first。
- 先呈現結論與需要使用者處理的事項，再逐步展開細節。
- 不使用 Emoji 作為 UI icon。
- 使用一致的 icon system。
- UX Writing 採台灣常用、直接、可操作的用語。
- 不使用模糊或擬人化的 AI 文案掩蓋系統實際行為。

## 6. 規格與實作

新的功能在流程與行為尚未收斂前，可以先於介面與 Mock Data 中驗證。

當功能已收斂並需要成為穩定行為時，再補進 specs/，至少包含：

- User Story / 使用情境
- 行為定義
- Acceptance Criteria
- 例外情境

目前不使用 OpenSpec。
