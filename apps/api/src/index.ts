import {createApp} from "./app"
import {startServer , stopServer} from "./server"
import { loadConfig } from "./config";

const config = loadConfig();
const app = createApp();
startServer(app , config);

const shutdown = async (signal : string ) =>{
    console.log(`[api] received ${signal} `);
    await stopServer();
    process.exit(0);
}

process.on("SIGINT" , shutdown);  //local dev
process.on("SIGTERM" , shutdown); // Docker / cloud shutdown 
