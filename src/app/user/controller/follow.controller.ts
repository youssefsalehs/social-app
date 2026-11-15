import { NextFunction, Request, Response } from "express";
import { FollowStatus } from "../model/follow.model";
import followService, { FollowService } from "../service/follow.service";
export class FollowController {
  private followService: FollowService = followService;
  followUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = await this.followService.follow({
        follower: req?.user?.id,
        following: req?.params?.id as string,
      });
      return res.status(200).json({
        success: true,
        message:
          status === FollowStatus.PENDING ? "Follow request sent" : "Followed",
      });
    } catch (err) {
      return next(err);
    }
  };

  unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await followService.unfollow({
        follower: req?.user?.id,
        following: req?.params?.id as string,
      });
      return res.status(200).json({ message: "Unfollowed", success: true });
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
      const requests = await this.followService.getPendingRequests(
        req?.user?.id,
      );
      res.status(200).json({ success: true, data: requests });
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
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
  getFollowers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await this.followService.getFollowList(
        req.params.id as string,
        req.user!.id,
        "followers",
      );
      res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  };

  getFollowing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const list = await this.followService.getFollowList(
        req?.params?.id as string,
        req.user!.id,
        "following",
      );
      res.status(200).json({
        success: true,
        data: list,
      });
    } catch (error) {
      next(error);
    }
  };
}
export default new FollowController();
