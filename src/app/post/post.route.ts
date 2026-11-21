import { Router } from "express";
import { guard } from "../../lib/auth/guard";
import { multerUploadArray } from "../../lib/media/multer";
import container from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { PostController } from "./controller/post.controller";

const postController = container.resolve<PostController>(TOKENS.PostController);
const postRouter = Router();

postRouter.post(
  "/",
  guard,
  multerUploadArray("media", 5),
  postController.createPost,
);
postRouter.get("/:id", guard, postController.getPost);
postRouter.get("/", guard, postController.getPosts);
postRouter.get("/my-posts", guard, postController.getPosts);
postRouter.patch("/:id", guard, postController.updatePost);
postRouter.delete("/:id", guard, postController.softDeletePost);
postRouter.delete("/:id/hard-delete", guard, postController.hardDeletePost);

export { postRouter };
