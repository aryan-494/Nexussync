import "dotenv/config";
import { createApp } from "./app.js";
import { startServer, stopServer } from "./server.js";
import { loadConfig } from "./config.js";
import { connectMongo, disconnectMongo } from "./db/mongo.js";
import { logger } from "./logger.js";

async function bootstrap() {
  const config = loadConfig();

  try {
    // 1️⃣ CONNECT DATABASE FIRST (blocking)
    await connectMongo();

    // 2️⃣ CREATE EXPRESS APP
    const app = createApp();

    // 3️⃣ START SERVER
    await startServer(app, config);

    logger.info("[api] server started successfully");
  } catch (error) {
    logger.error("[api] failed to start", error);
    process.exit(1);
  }
}

async function shutdown(signal: string) {
  logger.info(`[api] received ${signal}, shutting down...`);

  // Order matters
  await stopServer();
  await disconnectMongo();

  process.exit(0);
}

process.on("SIGINT", shutdown);   // local dev
process.on("SIGTERM", shutdown);  // docker / cloud

bootstrap();
