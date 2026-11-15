import { Router } from "express";

import { guard } from "../../lib/auth/guard";
import followController from "./controller/follow.controller";

const userRouter = Router();
userRouter.get("/pending-requests", guard, followController.getPendingRequests);
userRouter
  .route("/:id/follow")
  .post(guard, followController.followUser)
  .delete(guard, followController.unfollowUser);
userRouter.patch(
  "/request/:followerId",
  guard,
  followController.respondToRequest,
);

userRouter.get("/:id/followers", guard, followController.getFollowers);

userRouter.get("/:id/following", guard, followController.getFollowing);

export { userRouter };
