export type Plan = "free" | "premium" | "lifetime";
export type Role = "user" | "admin";

export interface User {
  id: string;
  email: string;
  password?: string;
  role: Role;
  plan: Plan;
  subscription_status: "active" | "inactive";
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
