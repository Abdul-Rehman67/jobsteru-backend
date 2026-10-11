import { Redis } from "ioredis";
import { env } from "../config/env.js";
import { logger } from "../common/logger/logger.js";

export async function connectRedis() {
  const redis = new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    connectTimeout: 5000,
    commandTimeout: 2000,
    retryStrategy(times) {
      if (times > 5) return null;
      return Math.min(times * 200, 2000);
    },
  });

  redis.on("error", (error) => {
    logger.error({ err: error }, "Redis connection error");
  });
  redis.on("connect", () => {
    logger.info("Redis connected");
  });

  await redis.connect();
  return redis;
}

export async function disconnectRedis(redis) {
  if (!redis) return;
  try {
    await redis.quit();
  } catch {
    redis.disconnect();
  }
}

export async function redisStatus(redis) {
  if (!redis) return "disabled";
  try {
    const reply = await redis.ping();
    return reply === "PONG" ? "up" : "down";
  } catch {
    return "down";
  }
}
