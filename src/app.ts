import express from "express";
import globalErrorHandler from "./pkg/error/globalErrorHandler";
import router from "./route";
import "./lib/db/connection";
export default function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/v1", router);
  app.use(globalErrorHandler);
  return app;
}
