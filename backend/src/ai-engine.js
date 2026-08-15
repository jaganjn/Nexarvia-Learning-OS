import crypto from "node:crypto";

function redact(text) {
  return String(text || "")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]")
    .slice(0, 12000);
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function lessonSections(lessonContent) {
  return Array.isArray(lessonContent?.lesson) ? lessonContent.lesson : [];
}

function conceptAliases() {
  return {
    "request": ["request", "requests"],
    "response": ["response", "responses"],
    "URL": ["url", "endpoint", "route"],
    "HTTP method": ["http method", "method", "get", "post", "put", "patch", "delete"],
    "payload": ["payload", "request body", "body", "json body"],
    "status code": ["status code", "http status", "status", "http 200", "http 400", "http 401", "http 403", "http 404", "http 500"],
    "response body": ["response body", "response data", "response json"]
  };
}

function evaluateCheckpoint(question, checkpoint) {
  const text = normalize(question);
  const requiredConcepts = Array.isArray(checkpoint?.requiredConcepts) && checkpoint.requiredConcepts.length
    ? checkpoint.requiredConcepts
    : ["request", "response", "URL", "HTTP method", "payload", "status code", "response body"];
  const aliases = conceptAliases();
  const matchedConcepts = requiredConcepts.filter(concept => {
    const candidates = aliases[concept] || [concept];
    return candidates.some(alias => text.includes(normalize(alias)));
  });
  const score = requiredConcepts.length ? matchedConcepts.length / requiredConcepts.length : 0;
  const evaluation = score >= 0.70 ? "correct" : score >= 0.20 ? "partially_correct" : "needs_review";
  const missing = requiredConcepts.filter(concept => !matchedConcepts.includes(concept));
  const nextAction = evaluation === "correct" ? "advance" : evaluation === "partially_correct" ? "retry" : "review";
  return { evaluation, score: Number(score.toFixed(2)), matchedConcepts, missingConcepts: missing, nextAction };
}

function findTeachingSection(question, content) {
  const sections = lessonSections(content);
  const q = normalize(question);
  if (!q) return null;
  const conceptHints = [
    { terms: ["status code", "http status", "http code"], headings: ["read the response"] },
    { terms: ["request", "url", "method", "payload"], headings: ["start with the request"] },
    { terms: ["network", "devtools", "developer tools"], headings: ["use the network panel"] },
    { terms: ["failure", "debug", "debugging", "cause", "evidence"], headings: ["explain the failure"] }
  ];
  for (const hint of conceptHints) {
    if (hint.terms.some(term => q.includes(normalize(term)))) {
      const section = sections.find(s => hint.headings.includes(normalize(s.heading)));
      if (section) return section;
    }
  }
  return sections.find(section => {
    const haystack = `${normalize(section.heading)} ${normalize(section.text)}`;
    return q.split(/\s+/).some(word => word.length > 4 && haystack.includes(word));
  }) || null;
}

function courseCompleteResponse() {
  return {
    type: "chat",
    state: "course_complete",
    nextAction: "course_complete",
    answer: "You've completed all lessons currently available in your learning path. ✓\n\nThere is no next lesson to advance to right now.\n\nYour completed work remains part of your learning record."
  };
}

function localResponse({ mode, question, context }) {
  const profile = context?.profile || {};
  const next = context?.nextLesson || null;
  const content = context?.syllabus?.content || null;
  const q = normalize(question);

  if (context?.courseComplete && !context?.nextLesson) return courseCompleteResponse();

  if (mode === "recommendation") {
    const weak = Array.isArray(context?.weakTopics) ? context.weakTopics : [];
    return {
      type: "recommendation",
      summary: weak.length ? `Prioritize ${weak[0].topic || "your weakest topic"} before moving forward.` : next ? `Continue with ${next.title} and complete one short practice activity.` : "Continue your learning path.",
      actions: weak.length
        ? [{actionType:"REVIEW_TOPIC",actionRef:weak[0].topic || "unknown",reason:"Recent learning signal",priority:1},{actionType:"PRACTICE",actionRef:weak[0].sourceId || "next-practice",reason:"Convert review into retrieval practice",priority:2}]
        : [{actionType:"CONTINUE_LESSON",actionRef:next?.id || "next",reason:"Maintain learning momentum",priority:1}]
    };
  }

  if (mode === "remediation") {
    return {
      type: "remediation",
      summary: "Use a review → explain → practice → retry loop on the most recent difficult concept.",
      steps: ["Review the relevant lesson section.","Explain the idea in your own words.","Complete 3–5 focused practice questions.","Retry the related checkpoint."]
    };
  }

  if (content?.checkpoint && q.includes("checkpoint")) {
    return { type:"chat", answer: content.checkpoint.question };
  }

  if (content?.checkpoint && (
    q.includes("what should i inspect") ||
    q.includes("what should you inspect") ||
    q.includes("what should i check") ||
    q.includes("answer the checkpoint") ||
    (q.includes("inspect") && q.includes("request") && q.includes("response"))
  )) {
    const evaluation = evaluateCheckpoint(question, content.checkpoint);
    const answer = evaluation.evaluation === "correct"
      ? `Good answer. ✓\n\nYou covered the key ideas from this checkpoint:\n\n${evaluation.matchedConcepts.map(x => `• ${x}`).join("\n")}\n\nYour answer is aligned with the lesson's debugging method: inspect the request and response before deciding what to change.\n\nLet's move to the next question.`
      : evaluation.evaluation === "partially_correct"
        ? `You're on the right track.\n\nYou identified:\n${evaluation.matchedConcepts.map(x => `• ${x}`).join("\n")}\n\nBut you're still missing:\n${evaluation.missingConcepts.map(x => `• ${x}`).join("\n")}\n\nTry answering the checkpoint again while including the missing pieces.`
        : `Let's slow down and use the evidence from the lesson.\n\nThe checkpoint asks:\n"${content.checkpoint.question}"\n\nA complete answer should mention:\n${evaluation.missingConcepts.map(x => `• ${x}`).join("\n")}\n\nTry again in your own words.`;
    return { type:"chat", ...evaluation, answer };
  }

  const teachingTriggers = ["today's lesson","todays lesson","current lesson","explain the lesson","what am i learning","teach me this lesson"];
  if (content && teachingTriggers.some(t => q.includes(t))) {
    const sections = lessonSections(content);
    const objectives = Array.isArray(content.objectives) ? content.objectives : [];
    const concepts = Array.isArray(content.concepts) ? content.concepts : [];
    const examples = Array.isArray(content.examples) ? content.examples : [];
    return {
      type:"chat",
      answer:`Absolutely. Let's work through "${context.syllabus.lesson}" from your current syllabus.\n\nCOURSE\n${context.syllabus.course}\n\nCHAPTER\n${context.syllabus.chapter}\n\nWHAT YOU SHOULD LEARN\n${objectives.map((x,i)=>`${i+1}. ${x}`).join("\n")}\n\nKEY CONCEPTS\n${concepts.join(" · ")}\n\nLESSON\n${sections.map(x=>`${x.heading}: ${x.text}`).join("\n\n")}\n\nEXAMPLES\n${examples.map(x=>`${x.request} — ${x.description}`).join("\n")}\n\nThe main idea is to inspect the evidence from the API request and response before guessing at the cause of a failure.\n\nIf you want, ask me about any one of these concepts and I'll explain it step by step.`
    };
  }

  const section = findTeachingSection(question, content);
  if (content && section) {
    return {
      type:"chat",
      answer:`Let's focus on this part of your current lesson:\n\n${section.heading}\n\n${section.text}\n\nThis comes directly from the syllabus lesson "${context.syllabus.lesson}".\n\nIf you'd like, explain this idea in your own words and I'll check your understanding.`
    };
  }

  const isFollowUp = ["explain that","explain this","simpler","more simply","what do you mean","tell me more","another example","give another example"].some(t => q.includes(t));
  if (isFollowUp && context?.recentConversation?.length) {
    const previous = context.recentConversation.at(-1);
    return { type:"chat", answer:`I can continue from your previous question:\n\n"${previous.question}"\n\n${previous.answer}` };
  }

  return {
    type:"chat",
    answer:`I can help you work through that.\n\nYour current learning context is:\n- Course: ${next?.courseTitle || "your current course"}\n- Next lesson: ${next?.title || "your current lesson"}\n- Learning mode: ${profile.learningMode || "Build-first"}\n\nAsk me the specific concept, error, exercise, or piece of code you're struggling with. I'll explain it in the context of your current learning path rather than turning every question into a recommendation.`
  };
}

export async function generateAI({mode="chat", question="", context={}}) {
  if (context?.courseComplete && !context?.nextLesson) {
    return { provider:"local-fallback", model:null, output:courseCompleteResponse() };
  }

  const url = process.env.AI_API_URL;
  const key = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "learning-model";
  if (!url || !key) return {provider:"local-fallback", model:null, output:localResponse({mode,question,context})};

  const prompt = [
    "You are the Nexarvia Learning OS learning assistant.",
    "Use only the supplied student-learning context. Do not invent grades, skills, credentials, or completed work.",
    "Teach directly; do not turn every question into a recommendation.",
    "When evaluating a checkpoint, preserve the machine-readable evaluation fields produced by the local tutor.",
    `Mode: ${mode}`,
    `Student context: ${JSON.stringify(context)}`,
    `Question: ${redact(question)}`
  ].join("\n");
  const response = await fetch(url, { method:"POST", headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`}, body:JSON.stringify({model,messages:[{role:"system",content:"You are a safe, student-focused learning assistant."},{role:"user",content:prompt}],temperature:0.2}) });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || data?.output_text || "";
  return {provider:"external",model,output:{type:mode,answer:text}};
}

export function stableId(input) { return crypto.createHash("sha256").update(String(input)).digest("hex").slice(0,16); }
