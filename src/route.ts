import { Router } from "express";
import { authRouter } from "./app/auth/auth.route";
import { userRouter } from "./app/user/user.route";
import { postRouter } from "./app/post/post.route";

const router = Router();
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/post", postRouter);

export default router;
