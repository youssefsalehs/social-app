import { GetProfilesDto } from "./../dto/user.dto";
import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { UserService } from "../service/user.service";

@injectable()
export class UserController {
  constructor(
    @inject(TOKENS.UserService) private readonly userService: UserService,
  ) {}
  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await this.userService.getMe(req?.user?.id as string);

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      return next(error);
    }
  };
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

  getProfiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = req.query;
      const { profiles, metaData } = await this.userService.getProfiles(
        filters as unknown as GetProfilesDto,
      );
      return res.status(200).json({
        success: true,
        data: profiles,
        metaData,
      });
    } catch (error) {
      return next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedProfile = await this.userService.updateProfile({
        userId: req.user!.id,
        data: req.body,
      });
      res.status(200).json({
        success: true,
        message: "user details updated",
        data: updatedProfile,
      });
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
  deactivate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string = req?.user?.id;
      await this.userService.deactivate(userId);
      res.clearCookie("access_token", { path: "/" });
      res.clearCookie("refresh_token", { path: "/api/v1/auth/" });
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };
}
