import { NextFunction, Request, Response } from "express";
import authService, { AuthService } from "../service/auth.service";
import generateTokens from "../utils/generateTokens";
class AuthController {
  private authService: AuthService = authService;

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newUser = await this.authService.register(req.body);
      return res.status(201).json({
        success: true,
        message: "user created successfully",
        data: newUser,
      });
    } catch (error) {
      return next(error);
    }
  };
  verifyAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedUser = await this.authService.verifyAccount(req.body);
      return res.status(200).json({
        success: true,
        message: "user verified successfully",
      });
    } catch (error) {
      return next(error);
    }
  };
  //controllers for  ordinary login && 2 step verification login
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, tokens } = await this.authService.login(req.body);
      if (!tokens) {
        return res.status(200).json({
          success: true,
          message: "an OTP code is sent to your email to complete login",
        });
      }
      generateTokens(res, tokens.accessToken, tokens.refreshToken);

      return res.status(200).json({
        success: true,
        message: "user logged in successfully",
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  };


  verifyLoginCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, tokens } = await this.authService.verifyLoginCode(req.body);
      generateTokens(res, tokens.accessToken, tokens.refreshToken);
      return res.status(200).json({
        success: true,
        message: "user logged in  successfully",
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  };

  sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.sendOtp(req.body);
      return res.status(200).json({
        success: true,
        message: "a new email is sent with a new otp",
      });
    } catch (error) {
      return next(error);
    }
  };
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.authService.resetPassword(req.body);

      return res.status(200).json({
        success: true,
        message: "Password successfully reset.",
      });
    } catch (error) {
      return next(error);
    }
  };
  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { accessToken, refreshToken } =
        await this.authService.loginWithGoogle(req.body);
      generateTokens(res, accessToken, refreshToken);

      return res.status(200).json({
        success: true,
        message: "user log in success",
      });
    } catch (error) {
      return next(error);
    }
  };
  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.refresh_token;
      const { accessToken, refreshToken } =
        await this.authService.refresh(token);
      generateTokens(res, accessToken, refreshToken);
      return res
        .status(200)
        .json({ success: true, message: "Token refreshed successfully" });
    } catch (error) {
      return next(error);
    }
  };

  //controllers for enabling 2 step verification
  enable2StepVerification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.authService.enable2StepVerification(req.body);
      return res.status(200).json({
        success: true,
        message: "Enabling two step verification request code is sent",
      });
    } catch (error) {
      return next(error);
    }
  };
  verifyEnable2StepVerification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.authService.verifyEnable2StepVerification(req.body);

      return res.status(200).json({
        success: true,
        message: "Two step verification is enabled now",
      });
    } catch (error) {
      return next(error);
    }
  };
}
export default new AuthController();
