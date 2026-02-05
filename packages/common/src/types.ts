export interface Task {
  id: string
  title: string
  status: "todo" | "done"
  createdAt: number
}
