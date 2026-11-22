import { AppError } from "../../pkg/error/error";

export const commentNotFound = new AppError("comment not found", 404);
export const commentNotAuthorized = new AppError(
  "not authorized to modify this comment",
  403,
);
export const invalidCommentContent = new AppError("content is required", 400);
export const commentsDisabled = new AppError(
  "comments are disabled on this post",
  409,
);
