// Status aligned with DB schema
export type UserStatus = "ACTIVE" | "DISABLED";

/**
 * Public user (what controllers return)
 * SAFE — no passwordHash
 */
export interface PublicUser {
  id: string;        // Mongo ObjectId as string
  email: string;
  status: UserStatus;
  createdAt: Date;
}

/**
 * Internal user creation input
 * (used inside services only)
 */
export interface CreateUserInput {
  email: string;
  passwordHash: string;
}
