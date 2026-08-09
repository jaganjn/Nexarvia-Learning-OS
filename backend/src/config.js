import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development","test","production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().url().default("http://localhost:5173")
});

export function loadConfig(env=process.env) {
  const result = schema.safeParse(env);
  if (!result.success) {
    throw new Error("Invalid environment configuration: " + result.error.issues.map(i=>i.path.join(".")).join(", "));
  }
  return result.data;
}
