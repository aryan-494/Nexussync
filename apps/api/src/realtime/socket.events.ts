import { getIO } from "./socket.server.js";
import { TaskModel } from "../db/models/task.model.js";
import { WorkspaceModel } from "../db/models/workspace.model.js";

export function initChangeStreams() {
  console.log("[socket] initializing change streams...");

  const changeStream = TaskModel.watch([], { // watch -> watch any db change in the steam []-> we want everything 
        fullDocument:"updateLookup", // update lookup means give me fullupdated document 
  });
changeStream.on("change", async (change) => {
  try {
    const fullDoc = change.fullDocument;

    if (!fullDoc) return;

    const workspaceId = fullDoc.workspaceId;

    // 🔥 fetch workspace to get slug
    const workspace = await WorkspaceModel.findById(workspaceId).select("slug");

    if (!workspace) return;

    const slug = workspace.slug;

    const room = `workspace:${slug}`;

    console.log("[socket] DB change → emitting to:", room);

    const io = getIO();

    io.to(room).emit("TASK_CHANGED", {
      workspaceSlug: slug,
      type: "TASK_CHANGED",
    });

  } catch (err) {
    console.error("[socket] change stream error:", err);
  }
});
}