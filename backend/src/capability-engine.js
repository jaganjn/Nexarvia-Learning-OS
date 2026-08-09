const LEVELS = [
  {min:0.0, level:"UNKNOWN"},
  {min:0.2, level:"BEGINNER"},
  {min:0.4, level:"DEVELOPING"},
  {min:0.6, level:"COMPETENT"},
  {min:0.8, level:"PROFICIENT"},
  {min:0.9, level:"VERIFIED"}
];

export function levelFor(mastery, verified=false) {
  if (verified && mastery >= 0.9) return "VERIFIED";
  let level = "UNKNOWN";
  for (const x of LEVELS) if (mastery >= x.min) level = x.level;
  return level;
}

export function scoreEvidence(evidence) {
  const score = typeof evidence.score === "number" ? Math.max(0, Math.min(100, evidence.score))/100 : 0.5;
  const verificationBoost = evidence.verified ? 1 : 0.7;
  const typeWeight = evidence.type === "PROJECT" ? 1.0 : evidence.type === "ASSESSMENT" ? 0.9 : 0.65;
  return Math.max(0, Math.min(1, score * verificationBoost * typeWeight));
}

export function aggregateMastery(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a,b)=>b.createdAt-a.createdAt);
  let weight=1, total=0, weights=0;
  for (const v of sorted.slice(0,10)) {
    total += v.value * weight;
    weights += weight;
    weight *= 0.85;
  }
  return weights ? total/weights : 0;
}
