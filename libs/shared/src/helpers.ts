export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const output = { ...target };

  for (const key in source) {
    if (isObject(source[key]) && isObject(target[key])) {
      output[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>,
      ) as T[Extract<keyof T, string>];
    } else {
      output[key] = source[key] as T[Extract<keyof T, string>];
    }
  }

  return output;
}
