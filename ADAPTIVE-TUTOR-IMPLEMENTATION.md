# Nexarvia Adaptive Tutor

This release adds the syllabus-aware adaptive tutoring loop developed during the implementation session.

## Backend

- `backend/src/learning-context.js` builds the authenticated student's course, lesson, progress, evidence, signal, capability, and recent-AI context.
- `backend/src/ai-engine.js` teaches from the current lesson content, evaluates the checkpoint, reports matched/missing concepts, and emits `nextAction` values.
- `backend/src/server.js` exposes `/api/ai/context` and `/api/ai/chat`, logs AI interactions, and advances the current lesson when a checkpoint is correct.
- Course completion is represented as `state: "course_complete"` and `nextAction: "course_complete"`.
- Existing lesson progress is reused through `LessonProgress` and enrollment progress.

## Adaptive states

- `advance` — checkpoint is correct; current lesson is completed.
- `retry` — answer is partially correct; missing concepts are returned.
- `review` — answer needs review.
- `course_complete` — there is no incomplete lesson in the enrolled learning path.

## Frontend

`frontend/ai-learning-engine.html` displays the adaptive state, evaluation, score, missing concepts, and completion message.

`frontend/api-client.js` supports `localStorage` and an optional `window.NEXARVIA_API_BASE` override for split frontend/backend deployments.

## Deployment

For a separately deployed frontend and API, set the backend `CORS_ORIGIN` environment variable to the exact frontend origin, for example:

`https://your-project.vercel.app`

Set the frontend API base to the deployed backend origin using `window.NEXARVIA_API_BASE` (or `localStorage.setItem("nexarvia-api-base", "https://your-api.example.com")`).

Do not commit real API keys, database URLs, JWT secrets, or production credentials.
