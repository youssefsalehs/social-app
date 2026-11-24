import { NextFunction, Request, Response } from "express";
import { FollowStatus } from "../model/follow.model";
import { FollowService } from "../service/follow.service";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { PaginateDto } from "../dto/follow.dto";

@injectable()
export class FollowController {
  constructor(
    @inject(TOKENS.FollowService) private readonly followService: FollowService,
  ) {}
  followUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = await this.followService.follow({
        follower: req?.user?.id,
        following: req?.params?.followingId as string,
      });
      return res.status(200).json({
        success: true,
        message:
          status === FollowStatus.PENDING
            ? "Follow request sent"
            : "Followed successfully",
      });
    } catch (err) {
      return next(err);
    }
  };

  unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.followService.unfollow({
        follower: req?.user?.id,
        following: req?.params?.followingId as string,
      });
      return res
        .status(200)
        .json({ message: "Unfollowed successfully", success: true });
    } catch (err) {
      return next(err);
    }
  };

  getPendingRequests = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { data, metaData } = await this.followService.getPendingRequests(
        req?.user?.id,
        req.query as unknown as PaginateDto,
      );
      res.status(200).json({ success: true, data, metaData });
    } catch (error) {
      next(error);
    }
  };
  respondToRequest = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { action } = req.body;
      const result = await this.followService.respondToRequest({
        following: req?.user?.id,
        follower: req?.params?.followerId as string,
        action,
      });
      const message =
        action === "reject"
          ? "Follow request rejected successfully"
          : "Follow request accepted successfully";
      res.status(200).json({
        success: true,
        message,
        data: action !== "reject" ? result : undefined,
      });
    } catch (error) {
      next(error);
    }
  };
  getFollowers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, metaData } = await this.followService.getList(
        req.params.id as string,
        req.user!.id,
        "followers",
        req.query as unknown as PaginateDto,
      );
      res.status(200).json({
        success: true,
        data,
        metaData,
      });
    } catch (error) {
      next(error);
    }
  };

  getFollowing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, metaData } = await this.followService.getList(
        req?.params?.id as string,
        req.user!.id,
        "following",
        req.query as unknown as PaginateDto,
      );
      res.status(200).json({
        success: true,
        data,
        metaData,
      });
    } catch (error) {
      next(error);
    }
  };
}
