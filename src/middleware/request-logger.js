import { randomUUID } from "node:crypto";
import { pinoHttp } from "pino-http";
import { logger } from "../common/logger/logger.js";
import { env } from "../config/env.js";

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req) => {
    const current = req.id;
    return current && current.length > 0 ? current : randomUUID();
  },
  autoLogging: {
    ignore: (req) => {
      const url = req.url ?? "";
      return url.startsWith(`${env.API_PREFIX}/health`);
    },
  },
  customLogLevel: (_req, res, error) => {
    if (error || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  customErrorMessage: (req, res, _error) => `${req.method} ${req.url} ${res.statusCode}`,
});
