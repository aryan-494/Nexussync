import { useParams, Navigate } from "react-router-dom";
import { useWorkspace } from "../../src/contexts/WorkspaceContext";
import { useTasks } from "../modules/tasks/useTasks";

export function TaskPage() {
  const { slug } = useParams<{ slug: string }>();
  const { loading: workspaceLoading, getWorkspaceBySlug } =
    useWorkspace();

  if (!slug) return <Navigate to="/workspaces" replace />;

  if (workspaceLoading) {
    return <div>Loading workspace...</div>;
  }

  const workspace = getWorkspaceBySlug(slug);

  if (!workspace) {
    return <Navigate to="/workspaces" replace />;
  }

  const {
    tasks,
    page,
    totalPages,
    loading,
    error,
    setPage,
    loadTasks,
    handleCreate,
    handleDelete,
  } = useTasks(slug);

  return (
    <div>
      <h2>Tasks for {workspace.name}</h2>
      <p>Your role: {workspace.role}</p>

      {error && <p>Error: {error.code}</p>}

      <button onClick={() => handleCreate("New Task")}>
        Add Task
      </button>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              {task.title}
              {workspace.role === "OWNER" && (
                <button onClick={() => handleDelete(task.id)}>
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div>
        <button
          disabled={page === 1}
          onClick={() => {
            setPage(page - 1);
            loadTasks(page - 1);
          }}
        >
          Prev
        </button>

        <span>
          Page {page} / {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => {
            setPage(page + 1);
            loadTasks(page + 1);
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}