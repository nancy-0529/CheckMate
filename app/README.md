# app — CheckMate 主原型

案件初審工作台：React 19 + TypeScript + Vite，純前端，8 筆預置模擬案件。線上版：<https://checkmate-demo-mauve.vercel.app>

```bash
npm install
npm run dev      # 本機開發
npm test         # 單元測試
npm run build    # production build
npm run lint
```

產品定義、設計規範與行為規格在上層的 [`docs/`](../docs/) 與 [`specs/`](../specs/)；實作現況與已知取捨見 [開發交接](../docs/development/handoff.md)。

部署：Vercel，SPA 路由由 `vercel.json` 導回 `index.html`。
