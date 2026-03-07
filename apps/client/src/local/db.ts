import Dexie, { Table } from "dexie";


/* ================================
   Task Entity
================================ */
export interface LocalTask {
  id: string;
  workspaceId: string;

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

export type OperationType = "TASK_CREATE" | "TASK_UPDATE" | "TASK_DELETE";


/* ================================
   Operation Log Entity
================================ */
export interface OperationLog {
      seq?: number;

  opId: string;
  type: OperationType;

  entityId: string;
  workspaceId: string;

  payload: any;

  createdAt: string;

  synced: boolean;
  failed?: boolean;


}


/* ================================
   Dexie Database
================================ */

class NexusSyncDB extends Dexie {

  tasks!: Table<LocalTask, string>;
  opLog!: Table<OperationLog, number>;

  constructor() {
    super("nexussync");

    this.version(1).stores({

      tasks: `
        id,
        workspaceId,
        [workspaceId+status],
        [workspaceId+assignedTo]
      `,

      opLog: `
        ++seq,
        opId,
        type,
        entityId,
        workspaceId,
        synced
      `,
    });
  }
}

export const db = new NexusSyncDB();

