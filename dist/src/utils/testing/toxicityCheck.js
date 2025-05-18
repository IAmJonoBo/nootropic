let model = null;
/**
 * Checks if the given text is toxic using the TensorFlow.js toxicity model.
 *
 * Example:
 *   const result = await checkToxicity('your text here');
 *   // result: { toxic: boolean, labels: string[] }
 */
export async function checkToxicity(text, threshold = 0.8) {
    try {
        if (!model) {
            // Lazy load tfjs and the toxicity model
            await import('@tensorflow/tfjs-node');
            const toxicity = await import('@tensorflow-models/toxicity');
            // Pass all default labels as the second argument for robust, type-safe usage
            model = await toxicity.load(threshold, [
                'toxicity',
                'severe_toxicity',
                'identity_attack',
                'insult',
                'threat',
                'sexual_explicit',
                'obscene'
            ]);
        }
        if (!model)
            throw new Error('Toxicity model not loaded');
        const predictions = await model.classify([text]);
        const toxicLabels = (predictions ?? []).filter(p => p.results && p.results[0] && p.results[0].match).map(p => p.label);
        return { toxic: toxicLabels.length > 0, labels: toxicLabels };
    }
    catch (e) {
        console.warn('[toxicityCheck] Could not load toxicity model or run check:', e);
        return { toxic: false, labels: [] };
    }
}
