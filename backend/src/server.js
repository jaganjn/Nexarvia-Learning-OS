import express from "express";
import cors from "cors";
import helmet from "helmet";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";
import { loadConfig } from "./config.js";

const prisma = new PrismaClient();
const app = express();
const config = loadConfig({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://nexarvia:nexarvia@localhost:5432/nexarvia?schema=public",
  JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "dev-local-secret-change-this-32chars"),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173"
});
const PORT = config.PORT;
const JWT_SECRET = config.JWT_SECRET;
const CORS_ORIGIN = config.CORS_ORIGIN;

app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Small in-memory guard for local/dev. Production should use a shared store
// (Redis/API gateway) so limits work across multiple instances.
const rate = new Map();
app.use((req,res,next) => {
  const key = req.ip + ":" + req.path;
  const now = Date.now();
  const hit = rate.get(key) || {start:now,count:0};
  if (now - hit.start > 60_000) { hit.start=now; hit.count=0; }
  hit.count += 1; rate.set(key, hit);
  if (hit.count > 120) return res.status(429).json({error:"Too many requests"});
  next();
});

const asyncRoute = (fn) => (req, res, next) => Promise.resolve(fn(req,res,next)).catch(next);

function hashAudit(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function requireRole(...roles) {
  return (req,res,next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({error:"Insufficient permissions"});
    next();
  };
}

function sign(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
}

const auth = asyncRoute(async (req, res, next) => {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) return res.status(401).json({ error: "Authentication required" });
  try {
    const payload = jwt.verify(h.slice(7), JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: "Invalid session" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

app.get("/health", (_req,res) => res.json({ ok:true, service:"nexarvia-learning-os", version:"5.1.0" }));
app.get("/ready", asyncRoute(async (_req,res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ok:true,database:"ready"});
}));

app.post("/api/auth/register", asyncRoute(async (req,res) => {
  const data = z.object({
    email:z.string().email(), password:z.string().min(8), name:z.string().min(2)
  }).parse(req.body);
  const exists = await prisma.user.findUnique({where:{email:data.email.toLowerCase()}});
  if (exists) return res.status(409).json({error:"Email already registered"});
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data:{
      email:data.email.toLowerCase(), name:data.name, passwordHash,
      profile:{create:{careerGoal:null}}
    }
  });
  res.status(201).json({token:sign(user), user:{id:user.id,email:user.email,name:user.name,role:user.role}});
}));

app.post("/api/auth/login", asyncRoute(async (req,res) => {
  const data = z.object({email:z.string().email(),password:z.string()}).parse(req.body);
  const user = await prisma.user.findUnique({where:{email:data.email.toLowerCase()}});
  if (!user || !(await bcrypt.compare(data.password,user.passwordHash))) return res.status(401).json({error:"Invalid credentials"});
  res.json({token:sign(user), user:{id:user.id,email:user.email,name:user.name,role:user.role}});
}));

app.get("/api/me", auth, asyncRoute(async (req,res) => {
  const user = await prisma.user.findUnique({
    where:{id:req.user.id},
    include:{profile:true}
  });
  res.json(user);
}));

app.get("/api/dashboard", auth, asyncRoute(async (req,res) => {
  const [profile,enrollments,evidence,recommendations,notifications] = await Promise.all([
    prisma.studentProfile.findUnique({where:{userId:req.user.id}}),
    prisma.enrollment.findMany({where:{userId:req.user.id},include:{course:true},orderBy:{lastSeenAt:"desc"}}),
    prisma.evidence.findMany({where:{userId:req.user.id},orderBy:{createdAt:"desc"},take:10}),
    prisma.recommendation.findMany({where:{userId:req.user.id},orderBy:{createdAt:"desc"},take:5}),
    prisma.notification.count({where:{userId:req.user.id,readAt:null}})
  ]);
  res.json({profile,enrollments,evidence,recommendations,unreadNotifications:notifications});
}));

app.get("/api/learning-path", auth, asyncRoute(async (req,res) => {
  const courses = await prisma.course.findMany({
    where:{published:true},
    include:{chapters:{include:{lessons:true},orderBy:{order:"asc"}}},
    orderBy:{createdAt:"asc"}
  });
  const enrollments = await prisma.enrollment.findMany({where:{userId:req.user.id}});
  res.json({courses,enrollments});
}));

app.post("/api/evidence", auth, asyncRoute(async (req,res) => {
  const data = z.object({
    title:z.string().min(2),
    type:z.enum(["QUIZ","PRACTICE","PROJECT","LIVE_CLASS","PORTFOLIO","INTERVIEW","ASSESSMENT"]),
    capabilityId:z.string().optional(),
    score:z.number().min(0).max(100).optional(),
    metadata:z.record(z.any()).optional()
  }).parse(req.body);
  const item = await prisma.evidence.create({data:{...data,userId:req.user.id}});
  res.status(201).json(item);
}));

app.post("/api/submissions", auth, asyncRoute(async (req,res) => {
  const data = z.object({title:z.string().min(2),evidenceId:z.string().optional()}).parse(req.body);
  const item = await prisma.submission.create({data:{...data,userId:req.user.id,status:"SUBMITTED"}});
  res.status(201).json(item);
}));

app.post("/api/recommendations/next", auth, asyncRoute(async (req,res) => {
  const profile = await prisma.studentProfile.findUnique({where:{userId:req.user.id}});
  const recent = await prisma.evidence.findMany({where:{userId:req.user.id},orderBy:{createdAt:"desc"},take:8});
  const hasProject = recent.some(e=>e.type==="PROJECT");
  const hasPractice = recent.some(e=>e.type==="PRACTICE");
  const action = hasProject ? "Interview Lab" : hasPractice ? "Project Lab" : "Practice Lab";
  const reason = {
    evidenceSignals: recent.length,
    mode: profile?.learningMode || "Build-first",
    rationale: hasProject ? "Convert project evidence into communication evidence." :
               hasPractice ? "Convert practice evidence into a durable project artifact." :
               "Create the first verified practice signal."
  };
  const score = 0.86;
  const recommendation = await prisma.recommendation.create({
    data:{userId:req.user.id,actionType:"MODULE",actionRef:action,reasonJson:reason,score}
  });
  res.json(recommendation);
}));

app.get("/api/graph", auth, asyncRoute(async (req,res) => {
  const edges = await prisma.learningEdge.findMany({where:{
    OR:[{fromId:req.user.id},{toId:req.user.id}]
  }});
  res.json({edges});
}));

app.post("/api/notifications/:id/read", auth, asyncRoute(async (req,res) => {
  const n = await prisma.notification.updateMany({
    where:{id:req.params.id,userId:req.user.id},
    data:{readAt:new Date()}
  });
  res.json({updated:n.count});
}));

app.get("/api/opportunities", auth, asyncRoute(async (_req,res) => {
  const opportunities = await prisma.opportunity.findMany({orderBy:{createdAt:"desc"},take:50});
  res.json({opportunities});
}));

app.patch("/api/opportunities/:id/status", auth, asyncRoute(async (req,res) => {
  const data = z.object({status:z.enum(["SAVED","APPLIED","INTERVIEW","OFFER","CLOSED"])}).parse(req.body);
  const item = await prisma.opportunity.update({where:{id:req.params.id},data});
  res.json(item);
}));

app.post("/api/courses", auth, requireRole("ADMIN","INSTRUCTOR"), asyncRoute(async (req,res) => {
  const data = z.object({
    slug:z.string().regex(/^[a-z0-9-]+$/), title:z.string().min(2),
    description:z.string().min(2), published:z.boolean().optional()
  }).parse(req.body);
  const course = await prisma.course.create({data});
  res.status(201).json(course);
}));

app.patch("/api/evidence/:id/verify", auth, requireRole("ADMIN","MENTOR","INSTRUCTOR"), asyncRoute(async (req,res) => {
  const evidence = await prisma.evidence.update({
    where:{id:req.params.id}, data:{verified:true}
  });
  res.json(evidence);
}));

app.patch("/api/profile", auth, asyncRoute(async (req,res) => {
  const data = z.object({
    careerGoal:z.string().max(200).optional(),
    learningMode:z.enum(["Build-first","Practice-first","Explain-first","Mentor-supported"]).optional()
  }).parse(req.body);
  const profile = await prisma.studentProfile.update({where:{userId:req.user.id},data});
  res.json(profile);
}));

app.use((err,_req,res,_next) => {
  console.error(err);
  const status = err?.name === "ZodError" ? 400 : 500;
  res.status(status).json({error:status===400?"Invalid request":"Internal server error"});
});

process.on("SIGINT", async()=>{await prisma.$disconnect();process.exit(0)});
process.on("SIGTERM", async()=>{await prisma.$disconnect();process.exit(0)});

app.listen(PORT,()=>console.log(`Nexarvia Learning OS API listening on :${PORT}`));
