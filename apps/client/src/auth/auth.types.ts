export type AuthStatus =
  | "unknown"
  | "authenticated"
  | "unauthenticated";

export type AuthUser = {
  id: string;
  email: string;
};

export type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  loading: boolean;
};
