import { useSyncExternalStore } from "react"

type SyncStatus = "idle" | "syncing" | "error"

let status: SyncStatus = "idle"

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function setSyncStatus(next: SyncStatus) {
  status = next
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