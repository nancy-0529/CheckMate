import { chromium } from 'playwright-core'
const b = await chromium.launch(); const p = await b.newPage()
await p.goto('file://' + process.cwd() + '/film.html?render')
const r = await p.evaluate(() => [...document.querySelectorAll('section.scene')].map(s => { const ts = []; for (let t = 0; t < window.__duration; t += .1) { window.__seek(t); if (+getComputedStyle(s).opacity > .5) ts.push(t) } return [s.id, ts.length ? ts[0].toFixed(1) : '-', ts.length ? ts.at(-1).toFixed(1) : '-'] }))
console.log(r.map(x => x.join(' ')).join('\n'), '\ndur', await p.evaluate(() => window.__duration)); await b.close()
