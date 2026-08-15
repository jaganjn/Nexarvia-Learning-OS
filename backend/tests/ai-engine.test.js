import test from "node:test";
import assert from "node:assert/strict";
import { generateAI } from "../src/ai-engine.js";

const content = {
  lesson: [
    { heading: "Start with the request", text: "Inspect the URL, HTTP method, and request payload." },
    { heading: "Read the response", text: "Inspect the HTTP status code and response body." },
    { heading: "Use the Network panel", text: "Inspect the failed request in browser developer tools." }
  ],
  concepts: ["API request and response", "HTTP method", "Request URL", "Request payload", "HTTP status code", "Response body"],
  checkpoint: {
    question: "What should you inspect when an API-driven page fails?",
    answer: "Inspect the actual request and response: URL, method, payload, status code, and response body.",
    requiredConcepts: ["request", "response", "URL", "HTTP method", "payload", "status code", "response body"]
  },
  objectives: ["Identify where an API request is failing."]
};

const baseContext = {
  profile: { learningMode: "Build-first" },
  nextLesson: { id: "lesson-1", title: "Debugging API failures", courseTitle: "Frontend Engineering" },
  syllabus: { course: "Frontend Engineering", chapter: "API Integration", lesson: "Debugging API failures", content },
  courseComplete: false,
  recentConversation: []
};

test("teaches from the current syllabus", async () => {
  const result = await generateAI({ question: "Can you explain HTTP status codes simply?", context: baseContext });
  assert.equal(result.output.type, "chat");
  assert.match(result.output.answer, /Read the response/);
  assert.match(result.output.answer, /HTTP status code/);
});

test("returns retry with missing concepts for a partial checkpoint answer", async () => {
  const result = await generateAI({ question: "I would inspect the request and response.", context: baseContext });
  assert.equal(result.output.evaluation, "partially_correct");
  assert.equal(result.output.nextAction, "retry");
  assert.deepEqual(result.output.missingConcepts, ["URL", "HTTP method", "payload", "status code", "response body"]);
});

test("returns advance for a complete checkpoint answer", async () => {
  const result = await generateAI({
    question: "When an API-driven page fails, I would inspect the request and response, including the URL, HTTP method, payload, status code, and response body.",
    context: baseContext
  });
  assert.equal(result.output.evaluation, "correct");
  assert.equal(result.output.score, 1);
  assert.equal(result.output.nextAction, "advance");
});

test("returns explicit course completion state", async () => {
  const result = await generateAI({ question: "What should I learn next?", context: { ...baseContext, nextLesson: null, syllabus: null, courseComplete: true } });
  assert.equal(result.output.state, "course_complete");
  assert.equal(result.output.nextAction, "course_complete");
});
