import { useSyncStatus } from "../local/sync/syncState"

export function SyncStatusIndicator() {
  const status = useSyncStatus()

  let label = ""
  let color = ""

  switch (status) {
    case "idle":
      label = "Synced"
      color = "green"
      break
    case "syncing":
      label = "Syncing..."
      color = "orange"
      break
    case "offline":
      label = "Offline"
      color = "red"
      break
    case "error":
      label = "Error"
      color = "darkred"
      break
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        padding: "6px 12px",
        borderRadius: "8px",
        background: "#111",
        color: "white",
        fontSize: "12px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color
        }}
      />
      {label}
    </div>
  )
}