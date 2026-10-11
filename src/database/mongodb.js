import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../common/logger/logger.js";

export async function connectMongo() {
  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connected");
  });
  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
  mongoose.connection.on("error", (error) => {
    logger.error({ err: error }, "MongoDB connection error");
  });

  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: !env.isProduction,
    serverSelectionTimeoutMS: 8000,
  });
}

export async function disconnectMongo() {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
}

export function mongoStatus() {
  return mongoose.connection.readyState === 1 ? "up" : "down";
}
