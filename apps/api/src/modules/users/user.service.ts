

// in this file bussiness logic for the user sign up 
// what are the things i needed when someone try to sign up 
// -> email must be normalize 
// -> password hashed 
// -> email unique 
// -> user object must be created and stroed in DB 
// -> return safe user data 

 import bcrypt from "bcrypt";
import { UserModel} from "../../db/models/user.model";
import { HttpError } from "../../errors";
import type { PublicUser } from "./user.types";

const SALT_ROUNDS = 10;

export async function signupUser(
  email: string,
  password: string
): Promise<PublicUser> {
  // 1️⃣ Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // 2️⃣ Validate password
  if (password.length < 8) {
    throw new HttpError(
      "Password must be at least 8 characters",
      409
    );
  }

  // 3️⃣ Check for existing user
  const existingUser = await UserModel.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new HttpError("Email already in use", 409);
  }

  // 4️⃣ Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // 5️⃣ Persist user (Mongo creates _id)
  const user = await UserModel.create({
  email: normalizedEmail,
  passwordHash,
  status: "ACTIVE",
});

  // 6️⃣ Return SAFE user data
 return {
  id: user._id.toString(),
  email: user.email,
  status: user.status,
  createdAt: user.createdAt, // now valid
};

}
