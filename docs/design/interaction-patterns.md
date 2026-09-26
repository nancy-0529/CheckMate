# Interaction Patterns

## 壹、核心原則

CheckMate 的互動設計必須讓使用者快速完成三件事：

1. 看懂 Agent 的結論。
2. 確認結論是否有足夠依據。
3. 採取正確的下一步。

互動順序採 **Outcome-first + Evidence-first**，不讓使用者先閱讀大量 AI 推理才知道結果。

## 貳、Case Review Pattern

案件 Detail 建議流程：

Case Summary → Recommendation → Blocking / Risk Signal → Required Checks → Findings → Evidence → Action → Audit Record

Recommendation 必須在首屏可見。

若存在 Blocking Issue，不應讓主要動作看起來仍可安全 Proceed。

## 參、Finding Pattern

每個 Finding 至少回答：

- 發現什麼？
- 嚴重程度？
- 依據什麼 Evidence？
- 對應哪一條 Rule / Source？
- 對 Recommendation 有什麼影響？

避免把多個不同問題塞進一段 AI Summary。

## 肆、Evidence Pattern

Evidence 應盡可能顯示：

- 原始值
- 資料來源
- 對應欄位
- 比對結果
- 必要時顯示原始文件位置

使用者應能從 Finding 回到 Evidence，而不是只能相信文字摘要。

## 伍、Recommendation Pattern

固定三種：

### 建議通過
必要檢查已完成，且沒有阻擋風險。不代表最終核准。

### 建議補件
缺少完成初審所需的資料或證據。必須明確說明「缺什麼」。

### 建議人工審核
存在高風險、不確定、規則衝突或需要專業判斷的情境。必須明確說明「為什麼需要人」。

## 陸、Workflow Action Pattern

Recommendation 與 Action 分開顯示。

### PROCEED
用於 Agent 初審已完成且符合自動推進條件。UI 文案應依情境使用「送往下一審核節點」「完成初審」等清楚動詞，避免讓使用者誤解為最終核准。

### REQUEST_INFO
用於缺件或資訊不足。操作前顯示需要補充的項目、通知對象與將執行的動作；執行後留下 Audit Record。

### ESCALATE
用於高風險、不確定或需人工專業判斷。清楚說明轉交原因、轉交對象／Queue 與 Agent 已完成哪些檢查。

### OVERRIDE
人工不同意 Agent 結果時使用。至少記錄原 Recommendation、Human Decision、Override Reason 與 Timestamp。

## 柒、Automation Gate Pattern

在允許 Agent 自動執行前，UI / System State 必須能反映：

- Required Checks 是否完成
- Evidence 是否充分
- Rule Result 是否明確
- 是否存在 Blocking Risk
- 是否存在未解決衝突
- Action 是否位於授權範圍

只要任一條件未滿足，自動執行即被阻擋。

不要用單一「AI Confidence」百分比取代上述控制條件。

## 捌、Confirmation Pattern

REQUEST_INFO、ESCALATE、OVERRIDE 與任何可能改變案件流程狀態的動作建議要求確認。

Confirmation 應寫清楚「即將發生什麼」，而不是只問「確定嗎？」

例如：

> 即將要求申請人補上住宿發票。送出後，案件會進入等待補件狀態。

## 玖、Status Wording

建議：

- 待審查
- 審查中
- 待補件
- 待人工審核
- 初審完成
- 已轉交

避免：

- AI 思考中
- AI 不太確定
- 看起來沒問題
- 可能安全

## 拾、Loading / Empty / Error

### Loading
可顯示實際階段，例如正在整理案件資料、比對憑證、檢查規範或產生審查結果。

### Empty
說明沒有內容的原因，例如「此案件目前沒有需要人工處理的風險項目」。

### Error
明確說明錯誤是否影響資料讀取、某項檢查、Recommendation 或 Action。

## 拾壹、Audit Pattern

Audit Timeline 以事件為單位，至少顯示：

- 時間
- Actor（Agent / Human / System）
- Action
- Result
- Reason（如適用）

使用者應能重建案件從進入 CheckMate 到目前狀態的主要決策歷程。

## 拾貳、Accessibility

- 所有 Action 可由 Keyboard 操作。
- Drawer / Modal 開啟時正確移動 Focus。
- Status 具文字 Label。
- Error 與 Warning 不只用顏色表示。
- 展開／收合元件具有可辨識的 Accessible Name。
