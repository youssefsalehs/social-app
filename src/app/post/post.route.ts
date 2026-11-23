import { Router } from "express";
import { guard } from "../../lib/auth/guard";
import { multerUploadArray } from "../../lib/media/multer";
import container from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { PostController } from "./controller/post.controller";
import { validate } from "../../lib/validation/validate";
import { CreatePostDto, UpdatePostDto } from "./validation/post.validation";

const postController = container.resolve<PostController>(TOKENS.PostController);
const postRouter = Router();

postRouter
  .route("/")
  .post(
    guard,

    multerUploadArray("media", 5),
    validate(CreatePostDto),
    postController.createPost,
  )
  .get(guard, postController.getMyPosts);

//get my archived posts
postRouter.get("/my-hidden-posts", guard, postController.getMyHiddenPosts);

//get public posts
postRouter.get("/feed", guard, postController.getPosts);

//get active posts for user
postRouter.get("/user/:userId", guard, postController.getActivePostsByUserId);

postRouter.get("/:id", guard, postController.getPost);

postRouter.patch(
  "/:id",
  guard,
  validate(UpdatePostDto),
  postController.updatePost,
);
postRouter.delete("/:id", guard, postController.softDeletePost);
postRouter.delete("/:id/hard-delete", guard, postController.hardDeletePost);

export { postRouter };
