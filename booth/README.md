# booth — 展場互動版

展場上讓訪客親手操作的 CheckMate：和 [`app/`](../app/) 不同，這一版有簡化的規則引擎，會依「企業規範」即時計算審查結果。線上版：<https://checkmate-booth.vercel.app>

四個頁面（`src/pages/`）：

| 頁面 | 內容 |
|---|---|
| `Submit` | 送件與進件：模擬員工在既有費用系統送件，CheckMate 接手處理（含補件重送） |
| `Workbench` | 案件工作台：審查建議、依據與處理 |
| `Policy` | 調整企業規範（費用上限、檢查項目、Agent 自動處置的授權範圍） |
| `Audit` | 稽核紀錄：每次判斷與處置的追溯 |

審查邏輯在 `src/engine.ts`，有單元測試（`src/engine.test.ts`）。所有資料皆為模擬資料。

```bash
npm install
npm run dev
npm test
npm run build
```
