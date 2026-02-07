export type UserStatus = "active" | "disabled";

export interface User {
  id: string;            // UUID v4
  email: string;         // unique, lowercase
  passwordHash: string;  // bcrypt hash
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input required to create a new user
 * (what signup accepts internally)
 */
export interface CreateUserInput {
  email: string;
  passwordHash: string;
}
