# video — 發布影片

CheckMate 發布影片（88.5 秒、1920×1080、60 fps，含音效），在簡報第 5 頁播放。**最終版是 v7。**

影片不是剪輯軟體做的，而是一個 HTML 頁面：`film.html` 用時間軸驅動所有動畫（`window.__seek(t)` 可跳到任一時間點），逐格截圖後編碼成 mp4；音效（點擊聲、提示音、環境音）由 `audio.html` 用 Web Audio 合成。

## 資料夾

```
video/
├── v7-source/        # 最終版原始檔
│   ├── film.html     # 畫面與時間軸
│   ├── audio.html    # 音效合成
│   └── mix.m4a       # 已渲染好的混音
├── tools/            # 渲染工具
│   ├── build.mjs     # 截圖 / 逐格輸出 / 音訊渲染（Playwright）
│   ├── scenes.mjs    # 列出每個場景的出現時間，用來檢查時間軸
│   ├── encode.swift  # 把逐格 JPG 編成 H.264（macOS AVFoundation）
│   └── mux.swift     # 把影片與音軌合成 mp4（macOS AVFoundation）
└── CHANGELOG.md      # v1–v7 版本紀錄
```

最終 mp4 不放在這裡（避免 repo 變大）：它已經包在 [`../pitch/slides/checkmate-pitch/assets/`](../pitch/slides/checkmate-pitch/assets/)，也附在 GitHub Release。

## 重新渲染

需要 macOS（編碼用 AVFoundation）與 Node.js。

```bash
cd tools && npm install && cd ..
npx playwright-core install chromium          # 第一次使用才需要

swiftc -O tools/encode.swift -o tools/encode
swiftc -O tools/mux.swift    -o tools/mux

cd v7-source
node ../tools/scenes.mjs                      # 檢查各場景時間
node ../tools/build.mjs shots 14 29           # 在 14、29 秒各截一張圖（shot-*.png）
FPS=60 node ../tools/build.mjs frames         # 輸出 5310 張 frames/*.jpg（約 1.4 GB，已被 .gitignore 排除）
../tools/encode frames video.mp4 60
../tools/mux video.mp4 mix.m4a CheckMate-Launch-Film-v7.mp4
```

`FPS` 一定要與 `encode` 的第三個參數一致；預設是 30，若忘了設成 60，輸出會是 30 fps 的版本。

音效需要重做時：`node ../tools/build.mjs audio` 會輸出 `mix.wav`，再轉成 `mix.m4a`（例如 macOS 的 `afconvert -f m4af -d aac mix.wav mix.m4a`）。`v7-source/mix.m4a` 已是渲染好的結果，一般不需要重做。
