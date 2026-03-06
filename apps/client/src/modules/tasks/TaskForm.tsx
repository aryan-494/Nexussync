import { useState } from "react";

type Props = {
  onCreate: (title: string) => Promise<void>;
};

export function TaskForm({ onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      setLoading(true);
      await onCreate(title);
      setTitle("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <button disabled={loading}>
        {loading ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}