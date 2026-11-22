import { Router } from "express";
import { guard } from "../../lib/auth/guard";
import container from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { FollowController } from "./controller/follow.controller";
const followController = container.resolve<FollowController>(
  TOKENS.FollowController,
);

export const followRouter = Router();
followRouter.get(
  "/pending-requests",
  guard,
  followController.getPendingRequests,
);
followRouter
  .route("/:id")
  .post(guard, followController.followUser)
  .delete(guard, followController.unfollowUser);
followRouter.patch(
  "/request/:followerId",
  guard,
  followController.respondToRequest,
);

followRouter.get("/:id/followers", guard, followController.getFollowers);

followRouter.get("/:id/following", guard, followController.getFollowing);
