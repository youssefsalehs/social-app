import "reflect-metadata";
import http from "node:http";
import createApp from "./app";
import mongoose from "mongoose";
import { env } from "./lib/config/env";

const app = createApp();
const server = http.createServer(app);
server.listen(env.port, () => console.log("running on port 5000"));
async function shutdown() {
  console.log("Shutting down...");
  await mongoose.disconnect();
  server.close();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
