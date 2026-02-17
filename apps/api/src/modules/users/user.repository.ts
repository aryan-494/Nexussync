import { UserModel } from "../../db/models/user.model";

/**
 * Find active user by email
 */
export async function findUserByEmail(email: string) {
  return UserModel.findOne({
    email: email.toLowerCase(),
    status: "ACTIVE",
  }).lean();
}

/**
 * Find user by Mongo ID
 */
export async function findUserById(id: string) {
  return UserModel.findById(id).lean();
}
