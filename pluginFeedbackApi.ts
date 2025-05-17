// NOTE: Requires 'express' and '@types/express' as dependencies.
import express, { Request, Response } from 'express';
// @ts-ignore
import { submitPluginFeedback, listFeedbackForPlugin, aggregatePluginFeedback } from '../../utils/feedback/pluginFeedback.js';
import { z } from 'zod';

const app: import("express").Application = express();
app.use(express.json());

// Zod schema for feedback submission
const FeedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1)
});

/**
 * Submit feedback for a plugin.
 * POST /plugin-feedback/:pluginName
 * Body: { rating: number (1-5), comment: string }
 */
app.post('/plugin-feedback/:pluginName', async (req: Request, res: Response) => {
  const parseResult = FeedbackSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Invalid feedback', details: parseResult.error.errors });
    return;
  }
  const { rating, comment } = parseResult.data;
  const pluginName = req.params['pluginName'];
  await submitPluginFeedback({ pluginName, rating, comment });
  res.status(201).json({ success: true });
});

/**
 * List feedback for a plugin.
 * GET /plugin-feedback/:pluginName
 */
app.get('/plugin-feedback/:pluginName', async (req: Request, res: Response) => {
  const feedback = await listFeedbackForPlugin(req.params['pluginName']);
  res.json(feedback);
});

/**
 * Get aggregate feedback for a plugin.
 * GET /plugin-feedback/:pluginName/aggregate
 */
app.get('/plugin-feedback/:pluginName/aggregate', async (req: Request, res: Response) => {
  const aggregate = await aggregatePluginFeedback(req.params['pluginName']);
  res.json(aggregate);
});

export { app }; 