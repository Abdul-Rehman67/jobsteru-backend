import { sendError } from "../common/http/api-response.js";

export function notFound(req, res) {
  sendError(res, 404, "NOT_FOUND", `No route matches ${req.method} ${req.originalUrl}`);
}
