import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

const capabilities = [
  ["react-systems","React Systems","Build maintainable React interfaces and state flows."],
  ["api-integration","API Integration","Integrate, debug and communicate API contracts."],
  ["technical-communication","Technical Communication","Explain implementation decisions clearly."]
];

async function main() {
  for (const [slug,name,description] of capabilities) {
    await prisma.capability.upsert({where:{slug},update:{name,description},create:{slug,name,description}});
  }
  const course = await prisma.course.upsert({
    where:{slug:"frontend-engineering"},
    update:{published:true},
    create:{slug:"frontend-engineering",title:"Frontend Engineering",description:"A capability-first frontend engineering path.",published:true}
  });
  const chapter = await prisma.chapter.upsert({
    where:{courseId_order:{courseId:course.id,order:1}},
    update:{title:"API Integration",contentJson:{format:"learning-os",version:1}},
    create:{courseId:course.id,title:"API Integration",order:1,contentJson:{format:"learning-os",version:1}}
  });
  await prisma.lesson.upsert({
    where:{chapterId_order:{chapterId:chapter.id,order:1}},
    update:{title:"Debugging API failures",kind:"PRACTICE", published:true},
    create:{chapterId:chapter.id,title:"Debugging API failures",kind:"PRACTICE", published:true,order:1}
  });
  const email = "demo@nexarvia.local";
  const passwordHash = await bcrypt.hash("ChangeMe123!",12);
  const user = await prisma.user.upsert({
    where:{email},
    update:{},
    create:{email,passwordHash,name:"Demo Student",profile:{create:{careerGoal:"Frontend Engineer",learningMode:"Build-first"}}}
  });
  await prisma.enrollment.upsert({
    where:{userId_courseId:{userId:user.id,courseId:course.id}},
    update:{progress:0.64},
    create:{userId:user.id,courseId:course.id,progress:0.64}
  });
  console.log("Seed complete. Demo:",email,"/ ChangeMe123!");
}
main().finally(()=>prisma.$disconnect());
