  // @ts-expect-error TS(2304): Cannot find name 'data'.
  if (typeof data === 'object' && data !== null && 'data' in data && Array.isArray((data as Record<string, unknown>)['data'])) {
    // @ts-expect-error TS(2304): Cannot find name 'data'.
    const dataArr = (data as Record<string, unknown>)['data'] as unknown[];
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    if (dataArr[0] && typeof dataArr[0] === 'object' && 'embedding' in (dataArr[0] as Record<string, unknown>) && Array.isArray((dataArr[0] as Record<string, unknown>)['embedding'])) {
      // @ts-expect-error TS(2352): Conversion of type 'string[]' to type 'number[]' m... Remove this comment to see the full error message
      return (dataArr[0] as Record<string, unknown>)['embedding'] as number[];
    }
  } 