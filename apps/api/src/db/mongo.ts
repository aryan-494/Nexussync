import mongoose from "mongoose";
import { loadConfig } from "../config";
import { logger } from "../logger";

// 🚨 Fail fast if Mongo is not connected
mongoose.set("bufferCommands", false);

let isConnected = false;

export async function connectMongo() {
  if (isConnected) {
    return;
  }

  const config = loadConfig();

  logger.info("[mongo] connecting...");

  await mongoose.connect(config.mongo.uri);

  isConnected = true;

  logger.info("[mongo] connected");
}

export async function disconnectMongo() {
  if (!isConnected) {
    return;
  }

  logger.info("[mongo] disconnecting...");

  await mongoose.disconnect();

  isConnected = false;

  logger.info("[mongo] disconnected");
}
