# Nexarvia Learning OS 4.0 — Core Integration

This build accelerates development by moving from isolated screens to one connected Student Dashboard experience.

## Integrated experience
- Student Dashboard is the front door.
- Learning Path provides direction.
- Course/Chapter and PDF Composer create learning content.
- Live Classroom connects synchronous learning.
- Practice Lab and Project Lab create action and evidence.
- AI Companion provides contextual help.
- Learning Twin models learner state.
- Learning Graph connects learning to capability and career.
- Skill Verification, Analytics, Planner and Mentor tools support progression.
- Interview Lab, Opportunity Studio and Application Copilot connect readiness to real opportunities.
- Project Collaboration makes group work individually evidentiary.

## Shared state
A lightweight browser-local state layer (`localStorage`) demonstrates cross-screen continuity for progress, focus, streak, application readiness and next actions. This is prototype behavior; a production backend should replace it with authenticated persistent data.

## UX
- Sidebar is independently scrollable.
- Main content scrolls independently.
- Responsive layouts are retained.
- Student Dashboard terminology is used throughout.

## Important
This is a product/UI integration prototype, not a production LMS backend. Authentication, database, video infrastructure, PDF extraction, AI services, payments, permissions and deployment are still engineering tasks for the production implementation.
