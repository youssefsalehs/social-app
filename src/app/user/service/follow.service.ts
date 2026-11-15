import { Types } from "mongoose";
import { FollowStatus } from "../model/follow.model";
import * as userErrors from "../errors";
import { FollowDto, RespondFollow, UnFollowDto } from "../dto/follow.dto";
import { AppError } from "../../../pkg/error/error";
import userRepository, { UserRepository } from "../repository/user.repo";
import followRepository, { FollowRepository } from "../repository/follow.repo";

export class FollowService {
  private userRepository: UserRepository = userRepository;
  private followRepository: FollowRepository = followRepository;

  follow = async (followDto: FollowDto) => {
    const { follower, following } = followDto;

    if (follower.toString() === following.toString()) {
      throw new AppError("You can't follow yourself", 400);
    }

    const target = await this.userRepository.getOne({
      _id: new Types.ObjectId(following),
    });

    if (!target || target.isDeleted) {
      throw userErrors.userNotFound;
    }

    const existing = await this.followRepository.getOne({
      follower: new Types.ObjectId(follower),
      following: new Types.ObjectId(following),
    });
    console.log(existing);
    if (existing) {
      if (existing.status === FollowStatus.ACCEPTED) {
        throw new AppError("You are already following this user", 400);
      }
      if (existing.status === FollowStatus.PENDING) {
        throw new AppError("Follow request is already pending", 400);
      }
    }

    const status = target.isPrivate
      ? FollowStatus.PENDING
      : FollowStatus.ACCEPTED;

    await this.followRepository.create({
      follower: new Types.ObjectId(follower),
      following: new Types.ObjectId(following),
      status,
    });

    if (status === FollowStatus.ACCEPTED) {
      await Promise.all([
        this.userRepository.updateFollowersCount(
          new Types.ObjectId(following),
          1,
        ),
        this.userRepository.updateFollowingCount(
          new Types.ObjectId(follower),
          1,
        ),
      ]);
    }
    console.log(status);

    return { status };
  };

  unfollow = async (unfollowDto: UnFollowDto) => {
    const { follower, following } = unfollowDto;

    const followRecord = await this.followRepository.getOne({
      follower: new Types.ObjectId(follower),
      following: new Types.ObjectId(following),
    });

    if (!followRecord) {
      throw new AppError("You are not following this user", 400);
    }

    await this.followRepository.delete({
      follower: new Types.ObjectId(follower),
      following: new Types.ObjectId(following),
    });

    if (followRecord.status === FollowStatus.ACCEPTED) {
      await Promise.all([
        this.userRepository.updateFollowersCount(
          new Types.ObjectId(following),
          -1,
        ),
        this.userRepository.updateFollowingCount(
          new Types.ObjectId(follower),
          -1,
        ),
      ]);
    }

    return { success: true };
  };
  getPendingRequests = async (userId: string) => {
    const requests = await this.followRepository.getPendingRequests(userId);
    return requests;
  };
  respondToRequest = async (respondFollow: RespondFollow) => {
    const followRequest = await this.followRepository.getOne({
      follower: respondFollow.follower,
      following: respondFollow.following,
      status: FollowStatus.PENDING,
    });

    if (!followRequest) {
      throw new Error("Follow request not found or already handled");
    }

    if (respondFollow.action === "accept") {
      followRequest.status = FollowStatus.ACCEPTED;
      await followRequest.save();
      return followRequest;
    }

    if (respondFollow.action === "reject") {
      await followRequest.deleteOne();
    }
  };
  getFollowList = async (
    targetUserId: string,
    currentUserId: string,
    type: "followers" | "following",
  ) => {
    const targetUser = await this.userRepository.getOne({ _id: targetUserId });
    if (!targetUser) {
      throw userErrors.userNotFound;
    }

    if (targetUser.isPrivate && targetUserId !== currentUserId) {
      const isApprovedFollower = await this.followRepository.getOne({
        follower: currentUserId,
        following: targetUserId,
        status: FollowStatus.ACCEPTED,
      });

      if (!isApprovedFollower) {
        throw new Error("This account is private");
      }
    }

    const isFollowersList = type === "followers";
    const filter = isFollowersList
      ? { following: targetUserId, status: FollowStatus.ACCEPTED }
      : { follower: targetUserId, status: FollowStatus.ACCEPTED };

    const populateField = isFollowersList ? "follower" : "following";

    const records = await this.followRepository.getFollowList(
      filter,
      populateField,
    );

    return records;
  };
}

export default new FollowService();
