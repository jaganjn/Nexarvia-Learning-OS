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
  const lessonContent = {
    lesson: [
      {heading:"Start with the request",text:"When an API-driven feature fails, inspect the request before changing code. Check the URL, HTTP method, request payload, and whether the request was actually sent."},
      {heading:"Read the response",text:"Next inspect the HTTP status code and response body. The response helps narrow down whether the problem is authentication, the requested resource, validation, or the server."},
      {heading:"Use the Network panel",text:"Open the browser developer tools and inspect the Network panel. Select the failed request and compare its URL, method, status, request data, and response."},
      {heading:"Explain the failure",text:"A good debugging explanation connects the observed evidence to the next action. Do not guess the cause before checking the request and response."}
    ],
    concepts:["API request and response","HTTP method","Request URL","Request payload","HTTP status code","Response body","Network debugging"],
    examples:[
      {request:"GET /api/courses",description:"The frontend asks the backend for available courses."},
      {request:"GET /api/lessons/:id",description:"The frontend requests a specific lesson."}
    ],
    practice:{
      steps:["Open the browser Network panel.","Find the lesson request.","Check the request URL and HTTP method.","Check the HTTP status code.","Read the response body.","State the most likely next debugging action and explain why."],
      scenario:"A learning page is not displaying its lesson data."
    },
    checkpoint:{
      question:"What should you inspect when an API-driven page fails?",
      answer:"Inspect the actual request and response: URL, method, payload, status code, and response body.",
      requiredConcepts:["request","response","URL","HTTP method","payload","status code","response body"]
    },
    objectives:["Identify where an API request is failing.","Read the request and response in the browser Network panel.","Use the HTTP status code to narrow down the failure.","Explain the failure and the next debugging step clearly."]
  };

  const lesson = await prisma.lesson.upsert({
    where:{chapterId_order:{chapterId:chapter.id,order:1}},
    update:{title:"Debugging API failures",kind:"EXERCISE",published:true,contentJson:lessonContent},
    create:{chapterId:chapter.id,title:"Debugging API failures",kind:"EXERCISE",published:true,order:1,contentJson:lessonContent}
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
