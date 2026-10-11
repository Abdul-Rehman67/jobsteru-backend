import { env } from "./config/env.js";
import { logger } from "./common/logger/logger.js";
import { connectMongo, disconnectMongo } from "./database/mongodb.js";
import { disconnectRedis } from "./database/redis.js";
// import { connectRedis } from "./database/redis.js";
import { createApp } from "./app.js";

async function shutdown(server, redis, signal) {
  logger.info({ signal }, "Shutting down");
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await disconnectRedis(redis);
  await disconnectMongo();
}

async function bootstrap() {
  await connectMongo();

  let redis = null;
  // Redis is paused until a local Redis server is running. Rate limits stay in memory.
  // try {
  //   redis = await connectRedis();
  // } catch (error) {
  //   if (env.isProduction) throw error;
  //   logger.warn({ err: error }, "Redis is unavailable. Rate limits will stay in memory until it connects.");
  // }

  const app = createApp({ redis });
  const server = await new Promise((resolve) => {
    const listening = app.listen(env.PORT, env.HOST, () => resolve(listening));
  });

  logger.info(`JobsterU API listening on http://${env.HOST}:${env.PORT}${env.API_PREFIX}`);

  let closing = false;
  const onSignal = (signal) => {
    if (closing) return;
    closing = true;
    shutdown(server, redis, signal)
      .then(() => process.exit(0))
      .catch((error) => {
        logger.error({ err: error }, "Graceful shutdown failed");
        process.exit(1);
      });
  };

  process.on("SIGINT", () => onSignal("SIGINT"));
  process.on("SIGTERM", () => onSignal("SIGTERM"));
}

bootstrap().catch((error) => {
  logger.error({ err: error }, "JobsterU API failed to start");
  process.exit(1);
});
