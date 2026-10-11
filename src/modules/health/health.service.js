import { env } from "../../config/env.js";
import { mongoStatus } from "../../database/mongodb.js";
import { redisStatus } from "../../database/redis.js";

export async function getHealth(redis) {
  const checks = {
    mongodb: mongoStatus(),
    redis: await redisStatus(redis),
  };
  const redisHealthy = checks.redis === "up" || checks.redis === "disabled";
  const status = checks.mongodb === "up" && redisHealthy ? "ok" : "degraded";

  return {
    status,
    service: "jobsteru-api",
    environment: env.NODE_ENV,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    checks,
  };
}

export function isReady(report) {
  if (report.checks.mongodb !== "up") return false;
  if (env.isProduction && report.checks.redis !== "up") return false;
  return true;
}
