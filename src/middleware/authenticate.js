import { AppError } from "../common/errors/app-error.js";
import { verifyAccessToken } from "../common/security/tokens.js";

export function requireAuth(req, _res, next) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    return;
  }

  try {
    req.auth = verifyAccessToken(header.slice("Bearer ".length).trim());
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.auth) {
      next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
      return;
    }
    if (!req.auth.role || !roles.includes(req.auth.role)) {
      next(new AppError(403, "FORBIDDEN", "You do not have access to this action"));
      return;
    }
    next();
  };
}
