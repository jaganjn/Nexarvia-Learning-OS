export function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'"
  };
}

export function validateProductionEnv(env) {
  const required = ["DATABASE_URL"];
  const missing = required.filter(k => !env[k]);
  const warnings = [];
  if (!env.NODE_ENV || env.NODE_ENV !== "production") warnings.push("NODE_ENV is not production");
  if (!env.SESSION_SECRET && !env.JWT_SECRET) warnings.push("No session/JWT secret configured");
  if (!env.AI_API_KEY) warnings.push("External AI provider is not configured; local fallback will be used");
  return {ok: missing.length === 0, missing, warnings};
}

export function readinessScore(checks) {
  const passed = checks.filter(x => x.ok).length;
  return checks.length ? Math.round((passed / checks.length) * 100) : 0;
}
