import type { Express } from "express";
import type { AppConfig } from "./config";
import type { Server } from "http";

let httpServer: Server | null = null;

export function startServer(app: Express , config: AppConfig) {


  httpServer = app.listen(config.port, () => {
    console.log(`[api] running on http://localhost:${config.port}`);
  });

  return httpServer;
}

export function stopServer(){

  return new Promise<void>((resolve , reject )=>{

    if(!httpServer){
      return resolve ;   //  No server? Nothing to close
    }

    console.log("[api] shutting down ... ");

    httpServer.close((err)=>{
      if(err){
        return reject (err); // Something went wrong
      }
      resolve(); // Successfully closed
    });
  });
}
