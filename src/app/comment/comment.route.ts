import { Router } from "express";
import { guard } from "../../lib/auth/guard";
import { multerUploadArray } from "../../lib/media/multer";
import container from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { CommentController } from "./controller/comment.controller";

const commentController = container.resolve<CommentController>(
  TOKENS.CommentController,
);
const commentRouter = Router();

commentRouter
  .route("/")
  .post(guard, multerUploadArray("media", 5), commentController.createComment);

commentRouter.get("/post/:postId", guard, commentController.getCommentsForPost);
//get replies of the comment
commentRouter
  .route("/:id/replies")
  .get(guard, commentController.getCommentReplies);

commentRouter
  .route("/:id")
  .get(guard, commentController.getComment)
  .patch(guard, commentController.updateComment)
  .delete(guard, commentController.deleteComment);

export { commentRouter };
