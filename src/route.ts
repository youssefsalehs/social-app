import { Router } from "express";
import { authRouter } from "./app/auth/auth.route";
import { userRouter } from "./app/user/user.route";
import { postRouter } from "./app/post/post.route";
import { commentRouter } from "./app/comment/comment.route";
import { followRouter } from "./app/follow/follow.route";

const router = Router();
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/post", postRouter);
router.use("/comment", commentRouter);
router.use("/follow", followRouter);
export default router;
