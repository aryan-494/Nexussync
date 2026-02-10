import "./env";

export type AppConfig = {
  env: string;
  port: number;
  mongo: {
    uri: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
  };
};

export function loadConfig(): AppConfig {
  const env = process.env.NODE_ENV ?? "development";

  const port = Number(process.env.PORT ?? 3000);
  if (Number.isNaN(port)) {
    throw new Error("PORT must be a number");
  }

  const mongoUri =
    process.env.MONGO_URI ?? "mongodb://localhost:27017/nexussync";

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not set");
  }

  const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? "900";

  return {
    env,
    port,
    mongo: {
      uri: mongoUri,
    },
    auth: {
      jwtSecret,
      jwtExpiresIn,
    },
  };
}

