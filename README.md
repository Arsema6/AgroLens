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
    .env.example               PORT, Kindwise keys, VISION_API_URL/KEY
    src/
      index.js                 Express app
      routes/
        analyze.js             POST /api/analyze (multipart image)
        health.js              GET /api/health
      services/
        visionModel.js         picks a provider: Kindwise, your endpoint, or the mock
        providers/
          kindwise.js          crop.health / plant.id request + response mapping
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

## The model

`server/src/services/visionModel.js` is the only seam. `classifyImage({ buffer, mimeType })` returns
`{ label, confidence, alternatives, source, crop?, advice? }`, and the provider is chosen by which
credentials are set, most specific first:

| Env | Provider |
| --- | --- |
| `CROP_HEALTH_API_KEY` | [crop.health](https://crop.kindwise.com/docs) (Kindwise) - crop disease/pest model, also names the crop |
| `PLANT_ID_API_KEY` | [plant.id](https://plant.id) (Kindwise) - wider plant health model, no crop name |
| `VISION_API_URL` (+ optional `VISION_API_KEY`) | your own label/score endpoint |
| none | deterministic mock - same photo always gives the same diagnosis, works offline |

A Kindwise key only works on the service it was issued for, so set the variable that matches your
key; `GET /api/health` reports which provider is live. Optional overrides: `CROP_HEALTH_API_URL`,
`PLANT_ID_API_URL`, `KINDWISE_LANGUAGE` (default `en`; Kindwise localises its advice text).

Both Kindwise services return a `treatment` detail already split into prevention / biological /
chemical, which `providers/kindwise.js` maps onto AgroLens' cultural / organic / chemical actions.
plant.id also returns a `is_healthy` verdict, which short-circuits to the `healthy` entry so a sound
leaf is not reported as diseased. Their label vocabulary is much larger than `adviceCatalog.js`, so
advice is resolved as: our own catalog copy
when we have an entry for the label (it is written for low-literacy field use), otherwise the
provider's text, backfilled from the fallback entry.
