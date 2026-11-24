import { Router } from "express";
import { guard } from "../../lib/auth/guard";
import container from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { multerUploadArray } from "../../lib/media/multer";
import { validate } from "../../lib/validation/validate";
import { CommentController } from "./controller/comment.controller";
import {
  CreateCommentDto,
  UpdateCommentDto,
} from "./validation/comment.validation";

const commentController = container.resolve<CommentController>(
  TOKENS.CommentController,
);
const commentRouter = Router();

commentRouter
  .route("/")
  .post(
    guard,
    multerUploadArray("media", 5),
    validate(CreateCommentDto),
    commentController.createComment,
  );
//get commments of post
commentRouter.get("/post/:postId", guard, commentController.getCommentsForPost);

//get replies of the comment
commentRouter
  .route("/:id/replies")
  .get(guard, commentController.getCommentReplies);

commentRouter
  .route("/:id")
  .get(guard, commentController.getComment)
  .patch(guard, validate(UpdateCommentDto), commentController.updateComment)
  .delete(guard, commentController.deleteComment);

export { commentRouter };
