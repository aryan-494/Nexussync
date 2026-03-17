import Dexie from "dexie";
import type { Table } from "dexie";

/* ================================
   Task Entity
================================ */

export interface LocalTask {
  id: string;
  workspaceSlug: string;

  title: string;
  description?: string;

  status: string;
  priority?: string;

  createdBy: string;
  assignedTo?: string;

  createdAt: string;
  updatedAt: string;

  synced: boolean;
}

/* ================================
   Operation Types
================================ */

export type OperationType =
  | "TASK_CREATE"
  | "TASK_UPDATE"
  | "TASK_DELETE";

/* ================================
   Operation Log Entity
================================ */

export interface OperationLog {
  seq?: number;

  opId: string;
  type: OperationType;

  entityId: string;
  workspaceSlug: string;

  payload: unknown;

  createdAt: string;

  synced: boolean;
  failed?: boolean;
}

/* ================================
   Sync Meta (Cursor Storage)
================================ */

export interface SyncMeta {
  key: string;
  value: number;
}

/* ================================
   Dexie Database
================================ */

class NexusSyncDB extends Dexie {
  tasks!: Table<LocalTask, string>;
  opLog!: Table<OperationLog, number>;
  syncMeta!: Table<SyncMeta, string>;

  constructor() {
    super("nexussync");

    this.version(2).stores({
      tasks: `
        id,
        workspaceSlug,
        updatedAt,
        [workspaceSlug+status],
        [workspaceSlug+assignedTo]
      `,

      opLog: `
        ++seq,
        opId,
        type,
        entityId,
        workspaceSlug,
        synced
      `,

      syncMeta: `
        key
      `
    });
  }
}

export const db = new NexusSyncDB();
// add this line 👇
;(window as any).db = db