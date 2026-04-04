


const workspacePresence = new Map<string, Set<string>>();
// to save workspace and user ex -> acme-inc , user1 

export function addUserToWorkspace(workspaceSlug:string , userId:string){
    // workspacechecker 
    if(!workspacePresence.has(workspaceSlug)){
        workspacePresence.set(workspaceSlug,new Set());
    }
    workspacePresence.get(workspaceSlug)!.add(userId);
}
export function removeUserFromWorkspace(workspaceSlug:string , userId:string){
    const user = workspacePresence.get(workspaceSlug);
    if(!user) return ;
    user.delete(userId);
    if(user.size===0){
        workspacePresence.delete(workspaceSlug);
    }

}

export function getUsersInWorkspace(workspaceSlug:string):string[]{
    return Array.from(workspacePresence.get(workspaceSlug)||[]);
}

export function getAllWorkspaces(){
    return Array.from(workspacePresence.keys());
}
