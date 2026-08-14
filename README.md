# AgroLens

AI-powered plant health scanner for smallholder farmers. Snap a photo of a leaf, get a probable
diagnosis with a confidence band, a plain-language explanation, and 2-3 recommended actions
(organic and chemical where relevant). Past scans are kept on the device.

- Frontend: React 18 + Vite + Tailwind CSS (mobile-first, high-contrast for outdoor sunlight)
- Backend: Node.js + Express
- AI: single placeholder classifier module (`server/src/services/visionModel.js`) to wire a real
  vision endpoint into later
- Storage: `localStorage` on the device, no auth

## Layout

```
agrolens/
  package.json                 npm workspaces + `npm run dev` (client + server together)
  client/                      React app
    index.html
    vite.config.js             dev server, /api proxy -> localhost:8787
    tailwind.config.js
    src/
      main.jsx                 app entry, router
      App.jsx                  routes: / (scan), /results/:scanId, /history
      index.css                Tailwind + theme tokens (earthy green, large touch targets)
      pages/
        ScanPage.jsx           capture or upload a photo, run analysis
        ResultsPage.jsx        diagnosis + confidence + explanation + actions
        HistoryPage.jsx        past scans, tap to reopen
      components/
        AppShell.jsx           header + bottom icon nav
        CameraCapture.jsx      camera input (capture="environment")
        ImagePicker.jsx        gallery upload + preview
        DiagnosisCard.jsx      diagnosis, crop, severity
        ConfidenceMeter.jsx    low / medium / high visual band
        ActionList.jsx         organic vs chemical action cards
        ScanHistoryItem.jsx    history row
        Icon.jsx               inline SVG icon set
      lib/
        api.js                 calls POST /api/analyze
        storage.js             localStorage scan history
        imageUtils.js          downscale + JPEG encode before upload/storage
  server/
    .env.example               PORT, VISION_API_URL, VISION_API_KEY
    src/
      index.js                 Express app
      routes/
        analyze.js             POST /api/analyze (multipart image)
        health.js              GET /api/health
      services/
        visionModel.js         PLACEHOLDER model call - swap in your own API here
        adviceCatalog.js       label -> explanation + organic/chemical actions
      middleware/
        errorHandler.js        JSON error responses
```

## Run locally

```bash
npm install
cp server/.env.example server/.env
npm run dev          # client on :5173, API on :8787
```

## Wiring your own model

`server/src/services/visionModel.js` exports `classifyImage({ buffer, mimeType })` and returns
`{ label, confidence, alternatives }`. With `VISION_API_URL` unset it returns deterministic mock
labels so the whole flow is usable offline; set `VISION_API_URL` / `VISION_API_KEY` and fill in the
marked request/response mapping to use a real endpoint. Everything downstream (advice catalog, UI)
keys off `label`, so no other file needs to change.
