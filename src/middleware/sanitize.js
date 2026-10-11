const blockedKeys = new Set(["__proto__", "constructor", "prototype"]);

export function stripDangerousKeys(value) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) stripDangerousKeys(item);
    return;
  }

  for (const key of Object.keys(value)) {
    if (key.startsWith("$") || key.includes(".") || blockedKeys.has(key)) {
      delete value[key];
      continue;
    }
    stripDangerousKeys(value[key]);
  }
}

/** Removes Mongo operator keys from JSON bodies before they reach a module. */
export function sanitizeRequest(req, _res, next) {
  stripDangerousKeys(req.body);
  next();
}
