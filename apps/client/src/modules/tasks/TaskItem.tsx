import type { Task } from "../../api/task.api";



type Props = {
  task: Task;
  canDelete: boolean;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: string) => Promise<void>;
};

export function TaskItem({
  task,
  canDelete,
  onDelete,
  onStatusChange,
}: Props) {

  function handleStatusChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    onStatusChange(task.id, e.target.value);
  }

  return (
    <li>

      <div>
        <strong>{task.title}</strong>
      </div>

      {task.description && (
        <div>
          {task.description}
        </div>
      )}

      <div>
        Status:

        <select
          value={task.status}
          onChange={handleStatusChange}
        >
          <option value="BACKLOG">BACKLOG</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>
      </div>

      <div>
        Priority: {task.priority}
      </div>

      <div>
        Assigned: {task.assignedTo ?? "—"}
      </div>

      {canDelete && (
        <button
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      )}

    </li>
  );
}