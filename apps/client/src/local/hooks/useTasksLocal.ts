import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";


export function useTaskLocal(workspaceSlug:string){

    const tasks = useLiveQuery(async =>{

        if(!workspaceSlug) return []

        return db.tasks.where("workspaceslug").equals(workspaceSlug).toArray();

    },[workspaceSlug])

    return tasks ?? []


}