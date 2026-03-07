import { useState } from "react";

type Props = {
  onCreate: (
    title: string,
    description?: string,
    priority?: string
  ) => Promise<void>;
};

export function TaskForm({ onCreate }: Props) {
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) return;

    try {

      setLoading(true);

      await onCreate(
        title,
        description || undefined,
        priority
      );

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");

    } finally {
      setLoading(false);
    }
  }


  return (
    <form onSubmit={handleSubmit}>

      <div>
        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label>Priority:</label>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>

      <button disabled={loading}>
        {loading ? "Creating..." : "Create Task"}
      </button>

    </form>
  );
}