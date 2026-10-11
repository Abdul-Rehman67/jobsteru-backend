import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { AppError } from "../errors/app-error.js";

const TOKEN_ISSUER = "jobsteru";
const TOKEN_AUDIENCE = "jobsteru-portal";

function sign(claims, secret, expiresIn) {
  const payload = {
    sub: claims.userId,
    email: claims.email,
    ...(claims.workspaceId ? { workspaceId: claims.workspaceId } : {}),
    ...(claims.role ? { role: claims.role } : {}),
  };

  return jwt.sign(payload, secret, {
    expiresIn,
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
  });
}

function readClaims(token, secret) {
  try {
    const decoded = jwt.verify(token, secret, {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });

    if (typeof decoded === "string" || typeof decoded.sub !== "string" || typeof decoded.email !== "string") {
      throw new AppError(401, "UNAUTHORIZED", "Invalid access token");
    }

    return {
      userId: decoded.sub,
      email: decoded.email,
      ...(typeof decoded.workspaceId === "string" ? { workspaceId: decoded.workspaceId } : {}),
      ...(typeof decoded.role === "string" ? { role: decoded.role } : {}),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(401, "UNAUTHORIZED", "Invalid or expired access token");
  }
}

export function signAccessToken(claims) {
  return sign(claims, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_TTL);
}

export function signRefreshToken(claims) {
  return sign(claims, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_TTL);
}

export function verifyAccessToken(token) {
  return readClaims(token, env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return readClaims(token, env.JWT_REFRESH_SECRET);
}
