---
name: testing-agrolens
description: How to run and end-to-end test the AgroLens scan flow (React/Vite client + Express API), including mobile viewport setup and driving the hidden file inputs from a browser automation harness.
---

# Testing AgroLens

## Devin Secrets Needed
None. There is no auth and the classifier is a local deterministic mock (`server/src/services/visionModel.js`)
whenever `VISION_API_URL` is unset in `server/.env`.

## Bring the app up
```bash
cd <repo>
npm install                          # npm workspaces (client + server)
[ -f server/.env ] || cp server/.env.example server/.env
npm run dev                          # client :5173 (proxies /api), API :8787
curl -s localhost:8787/api/health    # expect {"status":"ok","visionModel":"mock"}
curl -s localhost:5173/ | head -3    # expect the index.html shell
```

Known gotchas:
- A leftover dev server from a previous session may serve a **stale/broken Vite cache**: the page loads
  but `#root` stays empty and `import('/src/App.jsx')` rejects with `React is not defined` (the JSX was
  transformed with the classic runtime, i.e. the react plugin was not applied). Fix by killing the vite
  process, deleting `client/.vite` and `node_modules/.vite`, and restarting `npm run dev:client`.
  Symptom to watch for: a white page with no console errors — check
  `document.getElementById('root').innerHTML.length === 0` and try a manual dynamic import to see the error.
- `node --watch` does not restart a **crashed** API. On EADDRINUSE, kill the stale node on 8787 and
  `touch server/src/index.js`.

## Mobile-first viewport
The app is mobile-first (`max-w-md`, `sm:` breakpoint at 640px). CDP `Emulation.setDeviceMetricsOverride`
works but leaves most of a maximized window blank, and `Emulation.setPageScaleFactor` does not visibly zoom.
Resizing the real window is the most legible option for recordings (screen is often 1600x1200):
```bash
wmctrl -r :ACTIVE: -b remove,maximized_vert,maximized_horz
wmctrl -r :ACTIVE: -e 0,540,0,540,1180    # viewport ~508x1051 => mobile layout
# desktop regression pass:
wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz
```

## Driving the photo pickers
"Take photo" and "Choose photo" are buttons that `.click()` a **hidden** `<input type="file">`
(`client/src/components/CameraCapture.jsx`, `ImagePicker.jsx`). Keep the click a real user click and
intercept the chooser: start a background listener, then click the button with computer use.
```js
// waitpick.mjs — npm i playwright-core
import { chromium } from 'playwright-core';
const browser = await chromium.connectOverCDP('http://localhost:29229');
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes('localhost:5173')) ?? ctx.pages()[0];
const chooser = await page.waitForEvent('filechooser', { timeout: 60000 });
await chooser.setFiles(process.argv[2]);
await browser.close();
```
```bash
(nohup node waitpick.mjs /tmp/img/leaf1.jpg &) ; sleep 1   # then click "Choose photo" via computer use
```
Generate fixtures with PIL (a few visually distinct JPEGs, one 5000x4000, one `.txt` for the non-image case).

## What the mock guarantees
`sha256` of the **client-downscaled** bytes selects the label, so the same source file always yields the
same diagnosis and percentage, and different files usually yield different labels — a good determinism
assertion. Labels live in `server/src/services/adviceCatalog.js`; bands are high >=0.75, medium >=0.5
(`server/src/routes/analyze.js`).

## Error paths worth checking
- Non-image file: `ScanPage` rejects anything outside `image/*` before preview/upload → expect
  "Only photos can be checked. Choose a picture of the plant." An `image/*` file that fails to decode
  gives "That photo could not be opened. Take another one." The server's 415 text
  ("Only image files can be analysed.") is only reachable via the API:
  `curl -F 'image=@notes.txt;type=text/plain' localhost:8787/api/analyze`.
- API down: stop the node on 8787 → expect the banner "Could not analyse the photo. Try again.".
- History/persistence lives in `localStorage` under `agrolens.scans.v1`; clear it before a clean pass.
