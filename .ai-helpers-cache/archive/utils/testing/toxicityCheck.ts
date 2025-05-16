// Types for @tensorflow-models/toxicity are optional. Install @types/tensorflow__models__toxicity for full type safety.
// Fallback types if not available:
type Prediction = { label: string; results: { match: boolean }[] };
// @ts-expect-error TS(2693): 'Prediction' only refers to a type, but is being u... Remove this comment to see the full error message
type ToxicityClassifier = { classify: (inputs: string[]) => Promise<Prediction[]> };

let model: ToxicityClassifier | null = null;

/**
 * Checks if the given text is toxic using the TensorFlow.js toxicity model.
 *
 * Example:
 *   const result = await checkToxicity('your text here');
 *   // result: { toxic: boolean, labels: string[] }
 */
// @ts-expect-error TS(6133): 'text' is declared but its value is never read.
export async function checkToxicity(text: string, threshold = 0.8): Promise<{ toxic: boolean, labels: string[] }> {
  try {
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!model) {
      // Lazy load tfjs and the toxicity model
      // @ts-expect-error TS(2307): Cannot find module '@tensorflow/tfjs-node' or its ... Remove this comment to see the full error message
      await import('@tensorflow/tfjs-node');
      // @ts-expect-error TS(2307): Cannot find module '@tensorflow-models/toxicity' o... Remove this comment to see the full error message
      const toxicity = await import('@tensorflow-models/toxicity');
      // @ts-expect-error TS(2304): Cannot find name 'threshold'.
      model = await toxicity.load(threshold);
    }
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!model) throw new Error('Toxicity model not loaded');
    // @ts-expect-error TS(2304): Cannot find name 'predictions'.
    const predictions = await model.classify([text]);
    // @ts-expect-error TS(2304): Cannot find name 'toxicLabels'.
    const toxicLabels = (predictions ?? []).filter(p => p.results && p.results[0] && p.results[0].match).map(p => p.label);
    // @ts-expect-error TS(2365): Operator '>' cannot be applied to types '{ toxic: ... Remove this comment to see the full error message
    return { toxic: toxicLabels.length > 0, labels: toxicLabels };
  } catch (e) {
    console.warn('[toxicityCheck] Could not load toxicity model or run check:', e);
    return { toxic: false, labels: [] };
  }
} 