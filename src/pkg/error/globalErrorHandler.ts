import { NextFunction, Request, Response } from "express";
import { AppError } from "./error";

export default function globalErrorHandler(
  error: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational || false;

  return res.status(statusCode).json({
    success: false,
    message: isOperational ? error.message : "something went wrong",
    stack: error.stack,
  });
}
