import { asyncHandler } from "../../common/http/async-handler.js";
import { sendSuccess } from "../../common/http/api-response.js";
import { AppError } from "../../common/errors/app-error.js";
import { getHealth, isReady } from "./health.service.js";

export function createHealthController(redis) {
  return {
    live: asyncHandler(async (_req, res) => {
      sendSuccess(res, await getHealth(redis));
    }),
    ready: asyncHandler(async (_req, res) => {
      const report = await getHealth(redis);
      if (!isReady(report)) {
        throw new AppError(503, "NOT_READY", "Service dependencies are unavailable", report);
      }
      sendSuccess(res, report);
    }),
  };
}
