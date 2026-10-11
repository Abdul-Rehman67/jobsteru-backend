import { randomUUID } from "node:crypto";

export function requestContext(req, res, next) {
  const incoming = req.header("x-request-id");
  req.id = incoming && incoming.length <= 80 ? incoming : randomUUID();
  res.setHeader("x-request-id", req.id);
  next();
}
