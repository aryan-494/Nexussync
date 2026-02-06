import {createApp} from "./app"
import {startServer} from "./server"
import { loadConfig } from "./config";

const config = loadConfig();
const app = createApp();
startServer(app , config);
