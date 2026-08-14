import crypto from 'node:crypto';

import { knownLabels } from './adviceCatalog.js';
import { identifyWithKindwise } from './providers/kindwise.js';

/**
 * The single seam between AgroLens and whatever names the problem in the photo.
 *
 *   classifyImage({ buffer, mimeType }) -> {
 *     label: string,                                  // key in adviceCatalog, or a provider slug
 *     confidence: number,                             // 0..1
 *     alternatives: [{ label, confidence, name?, kind? }],
 *     source: string,
 *     crop?: string,                                  // which plant, when the provider says
 *     advice?: { name, kind, crops, explanation, actions },  // provider-supplied treatment advice
 *   }
 *
 * Providers are chosen by which credentials are present, most specific first:
 *   1. CROP_HEALTH_API_KEY -> crop.health (Kindwise), a purpose-built crop disease model
 *   2. PLANT_ID_API_KEY    -> plant.id (Kindwise), the wider plant health model
 *   3. VISION_API_URL      -> a generic label/score endpoint (your own model)
 *   4. none                -> deterministic mock, so the whole flow works offline
 */

const MOCK_LATENCY_MS = 700;

/** Kindwise issues a key per service, so the key that is set also picks the service. */
const KINDWISE_PROVIDERS = [
  { service: 'crop.health', keyVar: 'CROP_HEALTH_API_KEY', urlVar: 'CROP_HEALTH_API_URL' },
  { service: 'plant.id', keyVar: 'PLANT_ID_API_KEY', urlVar: 'PLANT_ID_API_URL' },
];

export async function classifyImage({ buffer, mimeType }) {
  const kindwise = activeKindwiseProvider();
  if (kindwise) {
    const prediction = await identifyWithKindwise({
      buffer,
      apiKey: process.env[kindwise.keyVar],
      service: kindwise.service,
      endpoint: process.env[kindwise.urlVar],
      language: process.env.KINDWISE_LANGUAGE,
    });
    return { ...prediction, source: kindwise.service };
  }

  const endpoint = process.env.VISION_API_URL;
  if (!endpoint) {
    return mockClassify(buffer);
  }
  return remoteClassify({ buffer, mimeType, endpoint });
}

/** Name of the active provider, for /api/health. */
export function describeProvider() {
  const kindwise = activeKindwiseProvider();
  if (kindwise) return kindwise.service;
  return process.env.VISION_API_URL ? 'remote' : 'mock';
}

function activeKindwiseProvider() {
  return KINDWISE_PROVIDERS.find(({ keyVar }) => process.env[keyVar]) ?? null;
}

async function remoteClassify({ buffer, mimeType, endpoint }) {
  // --- Wire your model here -------------------------------------------------
  // Most hosted vision endpoints take either multipart form data or a base64 payload.
  // Adjust the request body and the response mapping to match your provider.
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.VISION_API_KEY ? { Authorization: `Bearer ${process.env.VISION_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      image: buffer.toString('base64'),
      mime_type: mimeType,
      labels: knownLabels(),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    const error = new Error(`Vision API responded ${response.status}: ${detail.slice(0, 200)}`);
    error.status = 502;
    throw error;
  }

  const payload = await response.json();
  const predictions = normalisePredictions(payload);
  if (predictions.length === 0) {
    return { label: 'unknown', confidence: 0, alternatives: [], source: 'remote' };
  }
  const [top, ...rest] = predictions;
  return {
    label: top.label,
    confidence: top.confidence,
    alternatives: rest.slice(0, 2),
    source: 'remote',
  };
  // -------------------------------------------------------------------------
}

/**
 * Maps a provider response onto `[{ label, confidence }]`, sorted best first.
 * Accepts the two shapes most endpoints return: `{ predictions: [...] }` or `{ label, score }`.
 */
function normalisePredictions(payload) {
  const raw = Array.isArray(payload)
    ? payload
    : (payload.predictions ?? payload.results ?? (payload.label ? [payload] : []));

  return raw
    .map((item) => ({
      label: String(item.label ?? item.class ?? item.name ?? '').trim(),
      confidence: clampConfidence(item.confidence ?? item.score ?? item.probability),
    }))
    .filter((item) => item.label.length > 0 && Number.isFinite(item.confidence))
    .sort((a, b) => b.confidence - a.confidence);
}

/** Bands and percentages downstream assume 0..1, so provider scores are coerced into that range. */
function clampConfidence(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(1, Math.max(0, numeric)) : Number.NaN;
}

/**
 * Deterministic stand-in: the same image always yields the same diagnosis, so the UI and the
 * scan history behave predictably in development and demos.
 */
async function mockClassify(buffer) {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  const labels = knownLabels();
  const digest = crypto.createHash('sha256').update(buffer).digest();
  const primary = labels[digest[0] % labels.length];
  const secondary = labels[digest[1] % labels.length];
  const tertiary = labels[digest[2] % labels.length];

  const confidence = 0.55 + (digest[3] / 255) * 0.43;
  const remaining = 1 - confidence;

  const alternatives = [secondary, tertiary]
    .filter((label, index, all) => label !== primary && all.indexOf(label) === index)
    .map((label, index) => ({
      label,
      confidence: round(remaining * (index === 0 ? 0.6 : 0.25)),
    }));

  return { label: primary, confidence: round(confidence), alternatives, source: 'mock' };
}

function round(value) {
  return Math.round(value * 100) / 100;
}
