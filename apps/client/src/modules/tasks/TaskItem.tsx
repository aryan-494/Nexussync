import type { Task } from "../../api/task.api";

type Props = {
  task: Task;
  canDelete: boolean;
  onDelete: (id: string) => Promise<void>;
};

export function TaskItem({ task, canDelete, onDelete }: Props) {
  return (
    <li>
      <strong>{task.title}</strong>{" "}
      <span>({task.status})</span>

      {canDelete && (
        <button onClick={() => onDelete(task.id)}>
          Delete
        </button>
      )}
    </li>
  );
}