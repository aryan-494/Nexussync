import type { Task } from "../../api/task.api";
import { TaskItem } from "./TaskItem";

type Props = {
  tasks: Task[];
  canDelete: boolean;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: string) => Promise<void>;
};

export function TaskList({
  tasks,
  canDelete,
  onDelete,
  onStatusChange,
}: Props) {

  if (tasks.length === 0) {
    return <p>No tasks yet.</p>;
  }

  return (
    <ul>

      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          canDelete={canDelete}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}

    </ul>
  );
}