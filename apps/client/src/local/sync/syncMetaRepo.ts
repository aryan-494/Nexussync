import { db } from "../db"

const LAST_PULLED_AT_KEY = "lastPulledAt"

export const syncMetaRepo = {

  async getLastPulledAt(): Promise<number> {
    const record = await db.syncMeta.get(LAST_PULLED_AT_KEY)
    return record?.value || 0
  },

  async setLastPulledAt(timestamp: number): Promise<void> {
    await db.syncMeta.put({
      key: LAST_PULLED_AT_KEY,
      value: timestamp
    })
  }

}