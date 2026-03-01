// Fetch workspaces when user becomes authenticated
// Store workspaces
// Expose loading state
// Provide helper: getWorkspaceBySlug(slug)
// Provide active workspace derived from route


// src/contexts/WorkspaceContext.tsx

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getWorkspaces } from "../api/workspace.api";
import type { Workspace } from "../api/workspace.api";
import { useAuth } from "./AuthContext";
import type { AppError } from "../api/http";

type WorkspaceContextType = {
  workspaces: Workspace[];
  loading: boolean;
  getWorkspaceBySlug: (slug: string) => Workspace | undefined;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      return;
    }

    async function loadWorkspaces() {
      try {
        setLoading(true);
        const data = await getWorkspaces();
        setWorkspaces(data);
      } catch (error) {
        const err = error as AppError;
        console.error("Workspace fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWorkspaces();
  }, [isAuthenticated]);

  function getWorkspaceBySlug(slug: string) {
    return workspaces.find((w) => w.slug === slug);
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        loading,
        getWorkspaceBySlug,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}