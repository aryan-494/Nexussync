import {Redis} from "ioredis";

const isProd = process.env.NODE_ENV === "production";

export const redis = isProd
  ? null // ❌ disable in production for now
  : new Redis({
      host: "127.0.0.1",
      port: 6379,
    });

if (redis) {
  redis.on("connect", () => {
    console.log("[redis] connected");
  });

  redis.on("error", (err: Error) => {
    console.error("[redis] error:", err.message);
  });
}