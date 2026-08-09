export async function recordAudit(prisma, {userId=null, action, entityType, entityId=null, metadata=null}) {
  return prisma.auditLog.create({data:{userId,action,entityType,entityId,metadata}});
}

export async function recordEvent(prisma, {userId=null,type,path=null,entityType=null,entityId=null,metadata=null}) {
  return prisma.analyticsEvent.create({data:{userId,type,path,entityType,entityId,metadata}});
}

export async function queueJob(prisma, type, payloadJson={}) {
  return prisma.backgroundJob.create({data:{type,status:"QUEUED",payloadJson}});
}

export function summarizeEvents(events) {
  const total = events.length;
  const byType = {};
  for (const e of events) byType[e.type] = (byType[e.type]||0) + 1;
  return {total,byType};
}
