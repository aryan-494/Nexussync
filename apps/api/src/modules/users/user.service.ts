

// in this file bussiness logic for the user sign up 
// what are the things i needed when someone try to sign up 
// -> email must be normalize 
// -> password hashed 
// -> email unique 
// -> user object must be created and stroed in DB 
// -> return safe user data 

import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

import { User } from "./user.types";
import {
  findUserByEmail,
  insertUser,
} from "./user.repository";
import { HttpError } from "../../errors";

const SALT_ROUNDS = 10;

export async function signupUser(
  email: string,
  password: string
): Promise<User> {
  // 1️⃣ Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // 2️⃣ Validate password
  if (password.length < 8) {
    throw new HttpError( "Password must be at least 8 characters" , 409);
  }

  // 3️⃣ Check for existing user
  const existingUser = await findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new HttpError("Email already in use",409);
  }

  // 4️⃣ Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // 5️⃣ Create user entity
  const now = new Date();
  const user: User = {
    id: uuidv4(),
    email: normalizedEmail,
    passwordHash,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  // 6️⃣ Persist user
  await insertUser(user);

  // 7️⃣ Return domain user
  return user;
}
