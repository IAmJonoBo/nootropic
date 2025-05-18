/**
 * Extracts the embedding array from an OpenAI API response.
 * @param data The response object from OpenAI embedding API
 * @returns The embedding as number[] or an empty array if not found
 */
export function extractOpenAIEmbedding(data) {
    if (typeof data === 'object' && data !== null && 'data' in data && Array.isArray(data['data'])) {
        const dataArr = data['data'];
        if (dataArr[0] && typeof dataArr[0] === 'object' && 'embedding' in dataArr[0] && Array.isArray(dataArr[0]['embedding'])) {
            return dataArr[0]['embedding'];
        }
    }
    return [];
}
