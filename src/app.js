import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { requestContext } from "./middleware/request-context.js";
import { requestLogger } from "./middleware/request-logger.js";
import { sanitizeRequest } from "./middleware/sanitize.js";
import { createApiRateLimiter } from "./middleware/rate-limiter.js";
import { notFound } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";
import { registerModules } from "./modules/index.js";

export function createApp(deps) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", env.TRUST_PROXY);

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: env.BODY_LIMIT }));
  app.use(express.urlencoded({ extended: false, limit: env.BODY_LIMIT }));
  app.use(cookieParser());
  app.use(requestContext);
  app.use(requestLogger);
  app.use(sanitizeRequest);
  app.use(createApiRateLimiter(deps.redis));

  const api = express.Router();
  registerModules(api, deps.redis);
  app.use(env.API_PREFIX, api);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
