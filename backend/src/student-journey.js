export function journeyState({profile, progress=[], attempts=[], submissions=[], capabilities=[]}) {
  const nextLesson = progress.find(x => !x.completed) || null;
  const pendingReview = submissions.find(x => ["SUBMITTED","UNDER_REVIEW"].includes(x.status)) || null;
  const weakAssessment = attempts.find(x => typeof x.score === "number" && x.score < 70) || null;
  const nextCapability = capabilities.find(x => !x.verified && x.mastery < 0.8) || null;

  if (pendingReview) return {stage:"PROJECT_REVIEW", label:"Your project is waiting for review", entityId:pendingReview.id};
  if (weakAssessment) return {stage:"REMEDIATION", label:"Strengthen your latest weak assessment area", entityId:weakAssessment.assessmentId};
  if (nextLesson) return {stage:"LEARN", label:`Continue: ${nextLesson.lesson?.title || "next lesson"}`, entityId:nextLesson.lessonId};
  if (nextCapability) return {stage:"BUILD_CAPABILITY", label:`Build ${nextCapability.capability?.name || "your next capability"}`, entityId:nextCapability.capabilityId};
  return {stage:"CAREER", label:"Review your verified capabilities and opportunities", entityId:null};
}
