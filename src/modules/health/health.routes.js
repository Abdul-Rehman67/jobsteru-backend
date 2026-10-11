import { Router } from "express";
import { createHealthController } from "./health.controller.js";

export function createHealthRouter(redis) {
  const router = Router();
  const controller = createHealthController(redis);
  router.get("/", controller.live);
  router.get("/ready", controller.ready);
  return router;
}
