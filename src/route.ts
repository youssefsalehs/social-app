import { Router } from "express";
import { authRouter } from "./app/auth/auth.route";
import { userRouter } from "./app/user/user.route";

const router = Router();
router.use("/auth", authRouter);
router.use("/user", userRouter);
// router.use('/auth');
// router.use('/auth');
// router.use('/auth');

export default router;
