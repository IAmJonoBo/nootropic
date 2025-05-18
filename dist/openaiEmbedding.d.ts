/**
 * Extracts the embedding array from an OpenAI API response.
 * @param data The response object from OpenAI embedding API
 * @returns The embedding as number[] or an empty array if not found
 */
export declare function extractOpenAIEmbedding(data: unknown): number[];
