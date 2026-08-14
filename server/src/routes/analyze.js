import { randomUUID } from 'node:crypto';

import { Router } from 'express';
import multer from 'multer';

import { getAdvice, hasAdvice } from '../services/adviceCatalog.js';
import { classifyImage } from '../services/visionModel.js';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      const error = new Error('Only image files can be analysed.');
      error.status = 415;
      callback(error);
      return;
    }
    callback(null, true);
  },
});

export const analyzeRouter = Router();

analyzeRouter.post('/analyze', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error('No image was uploaded. Send a multipart field named "image".');
      error.status = 400;
      throw error;
    }

    const prediction = await classifyImage({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
    });

    res.json(buildScanResult(prediction));
  } catch (error) {
    next(error);
  }
});

function buildScanResult(prediction) {
  const advice = resolveAdvice(prediction);

  return {
    scanId: randomUUID(),
    createdAt: new Date().toISOString(),
    source: prediction.source,
    diagnosis: {
      label: prediction.label,
      name: advice.name,
      kind: advice.kind,
      crops: advice.crops,
      crop: prediction.crop ?? null,
      confidence: prediction.confidence,
      confidenceBand: toConfidenceBand(prediction.confidence),
      explanation: advice.explanation,
    },
    actions: advice.actions,
    alternatives: (prediction.alternatives ?? []).map((alternative) => {
      const alternativeAdvice = getAdvice(alternative.label);
      const preferLocal = hasAdvice(alternative.label);
      return {
        label: alternative.label,
        name: preferLocal ? alternativeAdvice.name : (alternative.name ?? alternativeAdvice.name),
        kind: preferLocal ? alternativeAdvice.kind : (alternative.kind ?? alternativeAdvice.kind),
        confidence: alternative.confidence,
        confidenceBand: toConfidenceBand(alternative.confidence),
      };
    }),
  };
}

/**
 * Our own catalog copy is written for low-literacy field use, so it wins whenever we have an entry
 * for the label. Otherwise a provider's advice is used and backfilled from the fallback entry, which
 * keeps a live model emitting unfamiliar labels useful instead of generic.
 */
function resolveAdvice(prediction) {
  const local = getAdvice(prediction.label);
  if (!prediction.advice || hasAdvice(prediction.label)) return local;

  const { advice } = prediction;
  return {
    name: advice.name || local.name,
    kind: advice.kind || local.kind,
    crops: advice.crops?.length ? advice.crops : local.crops,
    explanation: advice.explanation || local.explanation,
    actions: advice.actions?.length ? advice.actions : local.actions,
  };
}

/** Farmers see a band, not a decimal: high >= 0.75, medium >= 0.5, otherwise low. */
export function toConfidenceBand(confidence) {
  if (confidence >= 0.75) return 'high';
  if (confidence >= 0.5) return 'medium';
  return 'low';
}
