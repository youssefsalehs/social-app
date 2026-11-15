import { Router } from "express";
import { authRouter } from "./app/auth/auth.route";

const router = Router();
router.use("/auth", authRouter);
// router.use('/auth');
// router.use('/auth');
// router.use('/auth');
// router.use('/auth');

export default router;
