# Nexarvia Learning OS — Sprint 2
## Course & Content Engine

### Goal
Make the learning-content layer real and persistent:

**Course → Chapter → Lesson → Content → Enrollment → Progress**

### Included
- Course/chapter/lesson production data model
- Published/unpublished content states
- Lesson content types:
  - Reading
  - Video
  - PDF
  - Live
  - Practice
  - Project
  - Assessment
- Content asset model for PDFs, videos, documents, images and links
- Student course enrollment API
- Course detail API
- Lesson detail API
- Lesson progress persistence
- Automatic course-progress calculation
- Instructor/admin chapter and lesson creation APIs
- Instructor/admin lesson asset registration API
- Frontend API client integration

### External storage boundary
The content model supports storage keys and URLs, but a production object-storage provider (S3/GCS/Azure/etc.) still needs to be provisioned and connected for real PDF/video uploads.

### Local run
Use the Sprint 1 setup instructions, then run the Prisma migration and seed.
