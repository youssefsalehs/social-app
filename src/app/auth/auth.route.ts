import { Router } from "express";
// import authController from "./controller/auth.controller";
// ("./controller/auth.controller.js");
import container from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { AuthController } from "./controller/auth.controller";
const authController = container.resolve<AuthController>(TOKENS.AuthController);
const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.patch("/verify", authController.verifyAccount);

authRouter.post("/login", authController.login);

authRouter.post("/verify-login", authController.verifyLoginCode);

authRouter.post("/refresh", authController.refresh);
authRouter.post("/send-otp", authController.sendOtp);

authRouter.patch("/reset-password", authController.resetPassword);
authRouter.post("/google-login", authController.googleLogin);
// // endpoints to enable two step verification
authRouter.post(
  "/enable-2-step-verification",
  authController.enable2StepVerification,
);
authRouter.post(
  "/verify-code-enable-2-step-verification",
  authController.verifyEnable2StepVerification,
);

export { authRouter };
