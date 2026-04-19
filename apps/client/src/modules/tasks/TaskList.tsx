import { useTasksLocal } from "../../local/hooks/useTasksLocal";
import { TaskItem } from "./TaskItem";

type Props = {
  workspaceSlug: string;
  canDelete: boolean;
  onDelete: (id: string) => Promise<void>;
  onStatusChange: (id: string, status: string) => Promise<void>;
};

export function TaskList({
  workspaceSlug,
  canDelete,
  onDelete,
  onStatusChange,
}: Props) {

  const tasks = useTasksLocal(workspaceSlug);

  if (!tasks || tasks.length === 0) {
    return <p>No tasks yet.</p>;
  }

  return (
    <ul>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={{
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority ?? "MEDIUM",
            assignedTo: task.assignedTo ?? null,
          }}
          canDelete={canDelete}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </ul>
  );
}