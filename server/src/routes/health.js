import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    visionModel: process.env.VISION_API_URL ? 'remote' : 'mock',
  });
});
