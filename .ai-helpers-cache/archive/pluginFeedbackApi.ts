// NOTE: Requires 'express' and '@types/express' as dependencies.
import express, { Request, Response } from 'express';
import { submitPluginFeedback, listFeedbackForPlugin, aggregatePluginFeedback } from '../../utils/feedback/pluginFeedback.js';

const app = express();
app.use(express.json());

// Submit feedback
// @ts-expect-error TS(6133): 'req' is declared but its value is never read.
app.post('/plugin-feedback', async (req: Request, res: Response) => {
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  const { pluginName, user, rating, review } = req.body;
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  if (!pluginName || !user || typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'pluginName, user, and rating (1-5) are required.' });
  }
  try {
    await submitPluginFeedback({
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      pluginName,
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      user,
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      rating,
      // @ts-expect-error TS(2304): Cannot find name 'review'.
      ...(review ? { review } : {}),
      timestamp: new Date().toISOString(),
    });
    // @ts-expect-error TS(2304): Cannot find name 'res'.
    res.json({ success: true });
  } catch (e) {
    // @ts-expect-error TS(2304): Cannot find name 'res'.
    res.status(500).json({ error: String(e) });
  }
});

// List feedback for a plugin
// @ts-expect-error TS(6133): 'req' is declared but its value is never read.
app.get('/plugin-feedback/:pluginName', async (req: Request, res: Response) => {
  try {
    // @ts-expect-error TS(2304): Cannot find name 'feedback'.
    const feedback = await listFeedbackForPlugin(req.params.pluginName);
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    res.json(feedback);
  // @ts-expect-error TS(7006): Parameter 'e' implicitly has an 'any' type.
  } catch (e) {
    // @ts-expect-error TS(2304): Cannot find name 'res'.
    res.status(500).json({ error: String(e) });
  }
});

// Get aggregate feedback for a plugin
// @ts-expect-error TS(6133): 'req' is declared but its value is never read.
app.get('/plugin-feedback/:pluginName/aggregate', async (req: Request, res: Response) => {
  try {
    // @ts-expect-error TS(2304): Cannot find name 'aggregate'.
    const aggregate = await aggregatePluginFeedback(req.params.pluginName);
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    res.json(aggregate);
  // @ts-expect-error TS(7006): Parameter 'e' implicitly has an 'any' type.
  } catch (e) {
    // @ts-expect-error TS(2304): Cannot find name 'res'.
    res.status(500).json({ error: String(e) });
  }
});

export default app; 