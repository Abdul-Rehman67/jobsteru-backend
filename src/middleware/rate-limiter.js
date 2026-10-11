import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { env } from "../config/env.js";
import { sendError } from "../common/http/api-response.js";

function redisStore(redis, prefix) {
  return new RedisStore({
    prefix,
    sendCommand: (...args) => {
      const [command, ...rest] = args;
      if (!command) return Promise.reject(new Error("Redis command is missing"));
      return redis.call(command, ...rest);
    },
  });
}

function buildLimiter(options) {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: options.max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: (req) => req.path.startsWith(`${env.API_PREFIX}/health`),
    ...(options.redis ? { store: redisStore(options.redis, options.prefix) } : {}),
    handler: (req, res, _next, rateOptions) => {
      sendError(res, rateOptions.statusCode, "RATE_LIMITED", options.message);
      req.log?.warn({ path: req.path }, "Rate limit exceeded");
    },
  });
}

/** Shared limit for the portal API. Uses Redis when the process is connected. */
export function createApiRateLimiter(redis) {
  return buildLimiter({
    redis,
    max: env.RATE_LIMIT_MAX,
    prefix: "jobsteru:rl:api:",
    message: "Too many requests. Please wait and try again.",
  });
}

/**
 * Stricter limit for future sign-in and sign-up routes.
 * Attach it on those routers when the auth module is added.
 */
export function createAuthRateLimiter(redis) {
  return buildLimiter({
    redis,
    max: env.AUTH_RATE_LIMIT_MAX,
    prefix: "jobsteru:rl:auth:",
    message: "Too many authentication attempts. Please wait and try again.",
  });
}
