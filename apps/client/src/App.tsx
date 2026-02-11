import { useState } from "react"
import type { Task } from "@nexussync/common"
import { AuthProvider } from "./auth/AuthProvider"

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState("")
  

  const addTask = () => {
    if (!title.trim()) return

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      status: "todo",
      createdAt: Date.now(),
    }

    setTasks((prev) => [newTask, ...prev])
    setTitle("")
  }

 

  return (
    
    <div className="min-h-screen bg-bg text-text p-8">
      <h1 className="text-2xl font-semibold mb-6">NexusSync</h1>

      <div className="mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task..."
          className="w-full p-3 rounded bg-surface outline-none"
        />
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-surface p-3 rounded flex justify-between"
          >
            <span>{task.title}</span>
          </div>
        ))}
      </div>
    </div>
  )

   <AuthProvider>
      {/* routes will come later */}
      <div>App Loaded</div>
    </AuthProvider>
}

export default App

