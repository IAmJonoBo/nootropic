export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function deepMerge(target, source) {
  const output = { ...target };
  for (const key in source) {
    if (isObject(source[key]) && isObject(target[key])) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}
//# sourceMappingURL=helpers.js.map
