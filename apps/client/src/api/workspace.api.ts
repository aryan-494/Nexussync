// src/api/workspace.api.ts

import { http } from "./http";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  role: "OWNER" | "MEMBER";
};

export function getWorkspaces() {
  return http.get<Workspace[]>("/workspaces");
}

export function createWorkspace(name: string, slug: string) {
  return http.post<Workspace>("/workspaces", {
    name,
    slug,
  });
}