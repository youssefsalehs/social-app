import { AppError } from "../../pkg/error/error";

export const postNotFound = new AppError("post not found", 404);
export const postNotAuthorized = new AppError(
  "not authorized to modify this post",
  403,
);
export const invalidPostContent = new AppError("content is required", 400);
