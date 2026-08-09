# Sprint 4 — Projects & Evidence Engine

## Goal
Connect real project work to verified learning evidence:

**Project → Submission → Review → Verification → Evidence**

### Included
- Project model and lifecycle states
- Project publishing
- Student project submissions
- Repository/demo/submission URL support
- Submission history
- Mentor/instructor/admin review
- Rubric + score + feedback storage
- Approval / changes requested / rejection states
- Automatic verified evidence when a project is approved
- Student evidence listing and detail APIs
- Frontend API client integration

### Important boundary
This sprint stores project files as metadata/URLs. A production object-storage uploader and malware scanning pipeline still need to be connected before accepting arbitrary user uploads in production.
