import { MongoClient } from "mongodb"
import { config } from "../config"
import { logger } from "../logger"

let client: MongoClient | null = null

export async function connectMongo() {
  if (client) {
    return client
  }

  logger.info("Connecting to MongoDB...")

  client = new MongoClient(config.mongo.uri)

  await client.connect()

  logger.info("MongoDB connected")

  return client
}

export async function disconnectMongo() {
  if (!client) {
    return
  }

  logger.info("Disconnecting MongoDB...")

  await client.close()
  client = null

  logger.info("MongoDB disconnected")
}

export function getMongoClient(): MongoClient {
  if (!client) {
    throw new Error("MongoDB client not connected")
  }

  return client
}
