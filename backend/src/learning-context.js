export async function buildLearningContext(prisma, userId) {
  const [
    user,
    profile,
    enrollments,
    progress,
    evidence,
    signals,
    capabilities,
    recentAI
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true }
    }),
    prisma.studentProfile.findUnique({
      where: { userId },
      select: { careerGoal: true, learningMode: true, streak: true, readiness: true, twinConfidence: true }
    }),
    prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true, title: true, description: true,
            chapters: {
              orderBy: { order: "asc" },
              select: {
                id: true, title: true, order: true, contentJson: true,
                lessons: {
                  where: { published: true },
                  orderBy: { order: "asc" },
                  select: { id: true, title: true, kind: true, contentJson: true, durationMin: true, order: true }
                }
              }
            }
          }
        }
      },
      orderBy: { lastSeenAt: "desc" }
    }),
    prisma.lessonProgress.findMany({
      where: { userId },
      include: { lesson: { select: { id: true, title: true, chapterId: true } } },
      orderBy: { updatedAt: "desc" },
      take: 50
    }),
    prisma.evidence.findMany({
      where: { userId },
      select: { id: true, type: true, title: true, description: true, score: true, verified: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.learningSignal.findMany({
      where: { userId },
      select: { type: true, sourceId: true, topic: true, value: true, metadata: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 30
    }),
    prisma.capabilityProfile.findMany({
      where: { userId },
      include: { capability: { select: { name: true, description: true, category: true } } },
      orderBy: { mastery: "desc" },
      take: 30
    }),
    prisma.aIInteraction.findMany({
      where: { userId },
      select: { type: true, requestJson: true, responseJson: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  const progressByLesson = new Map(progress.map(item => [item.lessonId, item]));
  const courses = enrollments.map(enrollment => ({
    id: enrollment.course.id,
    title: enrollment.course.title,
    description: enrollment.course.description,
    progress: enrollment.progress,
    lastSeenAt: enrollment.lastSeenAt,
    chapters: enrollment.course.chapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.order,
      content: chapter.contentJson,
      lessons: chapter.lessons.map(lesson => {
        const p = progressByLesson.get(lesson.id);
        return {
          id: lesson.id,
          title: lesson.title,
          kind: lesson.kind,
          content: lesson.contentJson,
          durationMin: lesson.durationMin,
          order: lesson.order,
          progress: p
            ? { percent: p.percent, completed: p.completed, lastPosition: p.lastPosition || 0 }
            : { percent: 0, completed: false, lastPosition: 0 }
        };
      })
    }))
  }));

  const nextLesson = courses
    .flatMap(course => course.chapters.flatMap(chapter => chapter.lessons.map(lesson => ({
      ...lesson,
      courseId: course.id,
      courseTitle: course.title,
      chapterId: chapter.id,
      chapterTitle: chapter.title
    }))))
    .find(lesson => !lesson.progress.completed) || null;

  const recentConversation = recentAI.slice().reverse().flatMap(item => {
    const request = item.requestJson || {};
    const response = item.responseJson || {};
    const question = typeof request.question === "string" ? request.question : "";
    const answer = typeof response.answer === "string" ? response.answer : "";
    if (!question && !answer) return [];
    return [{ type: item.type, question: question.slice(0, 2000), answer: answer.slice(0, 4000), createdAt: item.createdAt }];
  });

  const syllabus = nextLesson
    ? { course: nextLesson.courseTitle, chapter: nextLesson.chapterTitle, lesson: nextLesson.title, content: nextLesson.content || null }
    : null;

  const courseComplete = courses.length > 0 && courses.every(course =>
    course.chapters.every(chapter => chapter.lessons.every(lesson => lesson.progress.completed))
  );

  const weakTopics = signals.filter(signal => signal.topic || signal.value != null).slice(0, 10);

  return {
    student: user,
    profile,
    courses,
    nextLesson,
    syllabus,
    courseComplete,
    recentProgress: progress,
    recentEvidence: evidence,
    learningSignals: signals,
    weakTopics,
    capabilities,
    recentConversation
  };
}
