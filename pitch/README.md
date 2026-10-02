# pitch — Demo Day 簡報

CheckMate 的 Pitch 簡報，用 [open-slide](https://github.com/) 框架（簡報即 React 元件）製作。線上版：<https://checkmate-pitch-mu.vercel.app/s/checkmate-pitch>

- **內容**：`slides/checkmate-pitch/index.tsx`。18 頁，其中前 8 頁是主線（封面 → 問題 → 現有做法的缺口 → 定位 → 影片 → 信任與控制 → 導入 → 結語），之後是備援頁（案件地圖、建議與動作、控制機制、證據、架構、決策飛輪、路線圖、利害關係人、資料來源）。講稿寫在同一個檔案的 `notes` 匯出，簡報者視角可看到。
- **影片**：第 5 頁播放 `slides/checkmate-pitch/assets/checkmate-film-v7.mp4`（發布影片最終版，原始檔在 [`../video/`](../video/)）。
- **圖片**：`assets/`、`slides/checkmate-pitch/assets/`。

```bash
pnpm install
pnpm dev       # 本機預覽
pnpm build     # 產出 dist/ 靜態網站
```

部署到 Vercel：`vercel.json` 已設定 SPA 導回 `index.html`。

> `AGENTS.md`（`CLAUDE.md` 為其連結）是 open-slide 框架附的 AI 協作規則。它提到的 skills 資料夾（`.agents/`、`.claude/skills`）未放進 repo，需要時執行 `pnpm sync:skills` 即可重新產生。
