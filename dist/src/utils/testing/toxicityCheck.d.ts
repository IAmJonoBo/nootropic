/**
 * Checks if the given text is toxic using the TensorFlow.js toxicity model.
 *
 * Example:
 *   const result = await checkToxicity('your text here');
 *   // result: { toxic: boolean, labels: string[] }
 */
export declare function checkToxicity(text: string, threshold?: number): Promise<{
    toxic: boolean;
    labels: string[];
}>;
