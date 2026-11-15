import express from "express";
import globalErrorHandler from "./pkg/error/globalErrorHandler";
import router from "./route";
import "./lib/db/connection";
import cookieParser from "cookie-parser";

export default function createApp() {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api/v1", router);
  app.use(globalErrorHandler);
  return app;
}
