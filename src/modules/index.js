import { createHealthRouter } from "./health/health.routes.js";

/**
 * Register every product module here.
 *
 * A module folder owns its own routes, controller, service, and mongoose model.
 * Keep HTTP concerns in the controller and persistence in the model. The service
 * is the only place that should know the business rules.
 *
 *   src/modules/<name>/<name>.routes.js
 *   src/modules/<name>/<name>.controller.js
 *   src/modules/<name>/<name>.service.js
 *   src/modules/<name>/<name>.model.js
 */
export function registerModules(api, redis) {
  api.use("/health", createHealthRouter(redis));
}
