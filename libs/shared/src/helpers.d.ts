export declare function sleep(ms: number): Promise<void>;
export declare function isObject(
  value: unknown,
): value is Record<string, unknown>;
export declare function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T;
