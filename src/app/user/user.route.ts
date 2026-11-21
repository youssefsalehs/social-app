import { Router } from "express";
import { guard } from "../../lib/auth/guard";
import followController from "./controller/follow.controller";
import container from "../../lib/di/container";
import { multerUploadSingle } from "../../lib/media/multer";
import { TOKENS } from "../../lib/di/tokens";
import { UserController } from "./controller/user.controller";
const userController = container.resolve<UserController>(TOKENS.UserController);
const userRouter = Router();
userRouter.get("/pending-requests", guard, followController.getPendingRequests);
userRouter.put("/update-profile", guard, userController.updateProfile);
userRouter.post(
  "/upload-profile-picture",
  guard,
  multerUploadSingle("pp"),
  userController.uploadProfilePicture,
);
userRouter.delete(
  "/profile-picture",
  guard,

  userController.deleteProfilePicture,
);
userRouter.post(
  "/upload-cover-picture",
  guard,
  multerUploadSingle("cp"),
  userController.uploadCoverPicture,
);
userRouter.delete("/cover-picture", guard, userController.deleteCoverPicture);
userRouter.patch(
  "/toggle-visibility",
  guard,
  userController.toggleProfileVisibility,
);
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
userRouter.get("/:username", guard, userController.getProfile);
export { userRouter };
