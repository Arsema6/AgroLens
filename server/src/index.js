import 'dotenv/config';

import cors from 'cors';
import express from 'express';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { analyzeRouter } from './routes/analyze.js';
import { healthRouter } from './routes/health.js';

const PORT = Number(process.env.PORT ?? 8787);

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', healthRouter);
  app.use('/api', analyzeRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

createApp().listen(PORT, () => {
  const mode = process.env.VISION_API_URL ? 'remote vision API' : 'mock classifier';
  console.log(`AgroLens API listening on http://localhost:${PORT} (${mode})`);
});
