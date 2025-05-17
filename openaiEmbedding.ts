/**
 * Extracts the embedding array from an OpenAI API response.
 * @param data The response object from OpenAI embedding API
 * @returns The embedding as number[] or an empty array if not found
 */
export function extractOpenAIEmbedding(data: unknown): number[] {
  if (typeof data === 'object' && data !== null && 'data' in data && Array.isArray((data as Record<string, unknown>)['data'])) {
    const dataArr = (data as Record<string, unknown>)['data'] as unknown[];
    if (dataArr[0] && typeof dataArr[0] === 'object' && 'embedding' in (dataArr[0] as Record<string, unknown>) && Array.isArray((dataArr[0] as Record<string, unknown>)['embedding'])) {
      return (dataArr[0] as Record<string, unknown>)['embedding'] as number[];
    }
  }
  return [];
} 