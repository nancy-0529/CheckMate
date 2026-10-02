import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { extname, join } from 'node:path'
const mode = process.argv[2]
const types = { '.html': 'text/html', '.wav': 'audio/wav', '.js': 'text/javascript', '.m4a': 'audio/mp4' }
const server = createServer((q, s) => { const p = join(process.cwd(), decodeURIComponent(q.url.split('?')[0])); if (!existsSync(p)) { s.writeHead(404); return s.end() } s.writeHead(200, { 'Content-Type': types[extname(p)] || 'application/octet-stream' }); s.end(readFileSync(p)) }).listen(8765)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
const errs = []; page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()) })
await page.goto('http://localhost:8765/film.html?render'); await page.evaluate(() => document.fonts.ready)
const data = await page.evaluate(() => ({ cues: window.__cues, vo: window.__vo, duration: window.__duration }))
if (mode === 'audio') {
  const ap = await browser.newPage(); ap.on('pageerror', e => errs.push(e.message)); ap.on('console', m => errs.push('[a] ' + m.text()))
  await ap.goto('http://localhost:8765/audio.html')
  const r = await ap.evaluate(d => window.renderAudio(d), data)
  writeFileSync('mix.wav', Buffer.from(r.b64, 'base64')); console.log('audio peak', r.peak.toFixed(3), 'rms', r.rms.toFixed(4), 'norm', r.norm.toFixed(3), 'cues', data.cues.length, 'unknown', r.unknown)
} else if (mode === 'shots') {
  for (const t of process.argv.slice(3).map(Number)) { await page.evaluate(t => window.__seek(t), t); await page.screenshot({ path: `shot-${t}.png` }) }
} else if (mode === 'frames') {
  rmSync('frames', { recursive: true, force: true }); mkdirSync('frames')
  const FPS = +(process.env.FPS || 30); const n = Math.round(data.duration * FPS)
  for (let i = 0; i < n; i++) { await page.evaluate(t => window.__seek(t), i / FPS); await page.screenshot({ path: `frames/${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 95 }) }
  console.log('frames', n)
}
console.log('errors', errs.slice(0, 10))
await browser.close(); server.close()
