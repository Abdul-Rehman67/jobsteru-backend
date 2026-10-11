import dotenv from "dotenv";
import { z } from "zod";

process.env.DOTENV_QUIET ??= "true";
dotenv.config();

if (process.env.NODE_ENV === "test") {
  process.env.LOG_LEVEL = "silent";
  process.env.MONGODB_URI ??= "mongodb://127.0.0.1:27017/jobsteru_test";
  process.env.REDIS_URL ??= "redis://127.0.0.1:6379";
  process.env.JWT_ACCESS_SECRET ??= "test-access-secret-must-be-at-least-32-chars";
  process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-must-be-at-least-32-chars";
  process.env.CORS_ORIGINS ??= "http://localhost:5173";
}

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    HOST: z.string().min(1).default("0.0.0.0"),
    API_PREFIX: z
      .string()
      .min(1)
      .default("/api/v1")
      .transform((value) => (value.startsWith("/") ? value.replace(/\/$/, "") : `/${value}`)),
    MONGODB_URI: z.string().min(1),
    REDIS_URL: z.string().min(1),
    CORS_ORIGINS: z.string().min(1),
    TRUST_PROXY: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_TTL: z.string().min(1).default("15m"),
    JWT_REFRESH_TTL: z.string().min(1).default("7d"),
    BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
    BODY_LIMIT: z.string().min(1).default("1mb"),
  })
  .transform((value) => ({
    ...value,
    corsOrigins: value.CORS_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    isProduction: value.NODE_ENV === "production",
    isTest: value.NODE_ENV === "test",
  }));

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const message = `Invalid environment configuration:\n${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}`;
  if (process.env.NODE_ENV === "test") {
    throw new Error(message);
  }
  console.error(message);
  process.exit(1);
}

export const env = parsed.data;
