import { Collection } from "mongodb";
import { getMongoClient } from "../../db/mongo";
import { User, CreateUserInput } from "./user.types";

const COLLECTION_NAME = "users";

function getUsersCollection(): Collection<User> {
  const client = getMongoClient();
  const db = client.db(); // uses DB from connection URI
  return db.collection<User>(COLLECTION_NAME);
}

/**
 * Ensure DB-level indexes exist.
 * This should be safe to call multiple times.
 */
export async function ensureUserIndexes() {
  const collection = getUsersCollection();

  await collection.createIndex(
    { email: 1 },
    { unique: true }
  );
}

/**
 * Insert a new user into the database.
 */
export async function insertUser(user: User): Promise<User> {
  const collection = getUsersCollection();

  await collection.insertOne(user);

  return user;
}

/**
 * Find a user by email (email must already be normalized).
 */
export async function findUserByEmail(
  email: string
): Promise<User | null> {
  const collection = getUsersCollection();

  return collection.findOne({ email });
}

/**
 * Find a user by id.
 */
export async function findUserById(
  id: string
): Promise<User | null> {
  const collection = getUsersCollection();

  return collection.findOne({ id });
}
