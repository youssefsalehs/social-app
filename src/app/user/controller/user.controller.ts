import { NextFunction, Request, Response } from "express";
import userService, { UserService } from "../service/user.service";
import { success } from "zod";

export class UserController {
  private userService: UserService = userService;
  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await this.userService.getProfileByUsername({
        username: req.params.username as string,
        viewerId: req.user?.id,
      });
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  };
  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.userService.updateProfile({
        userId: req.user!.id,
        data: req.body,
      });
      res.status(200).json({ success: true, message: "user details updated" });
    } catch (error) {
      next(error);
    }
  };

  toggleProfileVisibility = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const isPrivate = await this.userService.toggleProfileVisibility(
        req?.user?.id,
      );
      res.status(200).json({
        success: true,
        message: `profile is ${isPrivate ? "private" : "public"} now`,
      });
    } catch (error) {
      next(error);
    }
  };
  uploadProfilePicture = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.userService.uploadProfilePicture(
        req.file as Express.Multer.File,
        req?.user?.id,
      );
      return res.status(201).json({
        success: true,
        message: "uploaded profile picture",
      });
    } catch (error) {
      return next(error);
    }
  };
  uploadCoverPicture = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.userService.uploadCoverPicture(
        req.file as Express.Multer.File,
        req?.user?.id,
      );
      return res.status(201).json({
        success: true,
        message: "uploaded cover picture",
      });
    } catch (error) {
      return next(error);
    }
  };
  deleteProfilePicture = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.userService.deleteProfilePicture(req?.user?.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
  deleteCoverPicture = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await this.userService.deleteCoverPicture(req?.user?.id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}
export default new UserController();
