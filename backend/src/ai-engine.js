import crypto from "node:crypto";

function redact(text) {
  return String(text || "")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]")
    .slice(0, 12000);
}

function localResponse({mode, question, context}) {
  const profile = context?.profile || {};
  const weak = Array.isArray(context?.weakTopics) ? context.weakTopics : [];
  const next = context?.nextLesson || null;

  if (mode === "recommendation") {
    return {
      type: "recommendation",
      summary: weak.length
        ? `Prioritize ${weak[0].topic || "your weakest topic"} before moving forward.`
        : "Continue with the next incomplete lesson and complete one short practice activity.",
      actions: weak.length
        ? [
            {actionType:"REVIEW_TOPIC", actionRef:weak[0].topic || "unknown", reason:"Lowest recent learning signal", priority:1},
            {actionType:"PRACTICE", actionRef:weak[0].sourceId || "next-practice", reason:"Convert review into retrieval practice", priority:2}
          ]
        : [{actionType:"CONTINUE_LESSON", actionRef:next?.id || "next", reason:"Maintain learning momentum", priority:1}]
    };
  }

  if (mode === "remediation") {
    return {
      type: "remediation",
      summary: weak.length
        ? `Use a short remediation loop on ${weak[0].topic || "the weak area"}: review, explain, practice, then retry.`
        : "Use a review → explain → practice → retry loop on the most recent difficult concept.",
      steps: [
        "Review the relevant lesson section.",
        "Explain the idea in your own words.",
        "Complete 3–5 focused practice questions.",
        "Retry the related assessment or project step."
      ]
    };
  }

  return {
    type: "chat",
    answer: `I can help with that. Based on the learning record I have, your current mode is ${profile.learningMode || "Build-first"}. ${next ? `Your next incomplete lesson is “${next.title}”.` : "I do not yet have a next lesson selected."}`,
    question: redact(question)
  };
}

export async function generateAI({mode="chat", question="", context={}}) {
  const url = process.env.AI_API_URL;
  const key = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "learning-model";
  if (!url || !key) return {provider:"local-fallback", model:null, output:localResponse({mode,question,context})};

  const prompt = [
    "You are the Nexarvia Learning OS learning assistant.",
    "Use only the supplied student-learning context. Do not invent grades, skills, credentials, or completed work.",
    "Be concise, educational, and action-oriented.",
    `Mode: ${mode}`,
    `Student context: ${JSON.stringify(context)}`,
    `Question: ${redact(question)}`
  ].join("\n");

  const response = await fetch(url, {
    method:"POST",
    headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},
    body:JSON.stringify({
      model,
      messages:[
        {role:"system",content:"You are a safe, student-focused learning assistant."},
        {role:"user",content:prompt}
      ],
      temperature:0.2
    })
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || data?.output_text || "";
  return {provider:"external",model,output:{type:mode,answer:text}};
}

export function stableId(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex").slice(0,16);
}
