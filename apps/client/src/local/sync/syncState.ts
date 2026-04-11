import { useSyncExternalStore } from "react"

export type SyncStatus =
  | "idle"
  | "syncing"
  | "offline"
  | "error"

let status: SyncStatus = "idle"

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function setSyncStatus(next: SyncStatus) {
  if (status === next) return // ✅ prevent unnecessary re-renders

  status = next

  console.log("SYNC STATUS:", next) // 🔥 debug visibility

  emit()
}

export function useSyncStatus() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => status
  )
}