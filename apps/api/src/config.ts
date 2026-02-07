

export type AppConfig = {
    port:number;
}
export function loadConfig() : AppConfig {
    const port = Number(process.env) || 3000;

    return {
        port,
    };

}

export const config = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),

  mongo: {
    uri: process.env.MONGO_URI ?? "mongodb://localhost:27017/nexussync",
  },
}
