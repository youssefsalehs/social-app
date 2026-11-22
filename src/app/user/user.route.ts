import { Router } from "express";
import { guard } from "../../lib/auth/guard";
import container from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { multerUploadSingle } from "../../lib/media/multer";
import { UserController } from "./controller/user.controller";
const userController = container.resolve<UserController>(TOKENS.UserController);
const userRouter = Router();

userRouter.get("/me", guard, userController.getMe);
userRouter.put("/update-profile", guard, userController.updateProfile);
//get all profiles and contains searching , pagination
userRouter.get("/", guard, userController.getProfiles);

userRouter
  .route("/profile-picture")
  .post(guard, multerUploadSingle("pp"), userController.uploadProfilePicture)
  .delete(guard, userController.deleteProfilePicture);

userRouter
  .route("/upload-cover-picture")
  .post(guard, multerUploadSingle("cp"), userController.uploadCoverPicture)
  .delete(guard, userController.deleteCoverPicture);

userRouter.patch(
  "/toggle-visibility",
  guard,
  userController.toggleProfileVisibility,
);
userRouter.delete("/deactivate", guard, userController.deactivate);
userRouter.get("/suggestions", guard, userController.getSuggestions);
userRouter.get("/:username", guard, userController.getProfile);

export { userRouter };
