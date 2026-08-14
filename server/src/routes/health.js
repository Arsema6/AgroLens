import { Router } from 'express';

import { describeProvider } from '../services/visionModel.js';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    visionModel: describeProvider(),
  });
});
