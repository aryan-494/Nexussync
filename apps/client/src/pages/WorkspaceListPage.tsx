import { Link } from "react-router-dom";
import { useWorkspace } from "../contexts/WorkspaceContext";

export default function WorkspaceListPage() {
  const { workspaces, loading } = useWorkspace();

  if (loading) {
    return <div>Loading workspaces...</div>;
  }

  if (workspaces.length === 0) {
    return <div>No workspaces found.</div>;
  }

  return (
    <div>
      <h2>Your Workspaces</h2>

      <ul>
       {workspaces.map ((workspace)=>(
        <li key={workspace.id}>
            <Link to={`/w/${workspace.slug}/tasks`} >
            {workspace.name}</Link>
             {" "}— Role: {workspace.role}
        </li>

       ))}
        
      </ul>
    </div>
  );
}