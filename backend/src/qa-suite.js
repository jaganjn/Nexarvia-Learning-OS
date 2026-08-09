export function validateApiPayload(value, required=[]) {
  const missing = required.filter(k => value?.[k] === undefined || value?.[k] === null || value?.[k] === "");
  return {ok: missing.length === 0, missing};
}
export function sanitizeError(err) {
  return {message:"Request failed", code:err?.code || "INTERNAL_ERROR"};
}
export function smokeChecks() {
  return [
    {name:"Runtime", ok:typeof process!=="undefined"},
    {name:"JSON", ok:typeof JSON.parse==="function"},
    {name:"Date", ok:!Number.isNaN(Date.now())}
  ];
}
