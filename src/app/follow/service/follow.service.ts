import { Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { AppError } from "../../../pkg/error/error";
import * as userErrors from "../../user/errors";
import { UserRepository } from "../../user/repository/user.repo";
import {
  FollowDto,
  PaginatedRequests,
  PaginateDto,
  RespondFollow,
  UnFollowDto,
} from "../dto/follow.dto";
import { IFollow } from "../interface/follow.interface";
import { FollowStatus } from "../model/follow.model";
import { FollowRepository } from "../repository/follow.repo";

@injectable()
export class FollowService {
  constructor(
    @inject(TOKENS.UserRepository)
    private readonly userRepository: UserRepository,
    @inject(TOKENS.FollowRepository)
    private readonly followRepository: FollowRepository,
  ) {}

  follow = async (followDto: FollowDto) => {
    const followerId = this.toObjectId(followDto.follower);
    const followingId = this.toObjectId(followDto.following);

    if (followerId.equals(followingId)) {
      throw new AppError("You can't follow yourself", 400);
    }

    const target = await this.findActiveUserOrThrow(followingId);

    const existing = await this.followRepository.getOne({
      follower: followerId,
      following: followingId,
    });

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
      follower: followerId,
      following: followingId,
      status,
    });

    if (status === FollowStatus.ACCEPTED) {
      await this.adjustFollowCounts(followerId, followingId, 1);
    }

    return { status };
  };
  unfollow = async (unfollowDto: UnFollowDto) => {
    const followerId = this.toObjectId(unfollowDto.follower);
    const followingId = this.toObjectId(unfollowDto.following);

    const followRecord = await this.followRepository.getOne({
      follower: followerId,
      following: followingId,
    });

    if (!followRecord) {
      throw new AppError("You are not following this user", 400);
    }

    await this.followRepository.delete({
      follower: followerId,
      following: followingId,
    });

    if (followRecord.status === FollowStatus.ACCEPTED) {
      await this.adjustFollowCounts(followerId, followingId, -1);
    }

    return { success: true };
  };
  respondToRequest = async (respondFollow: RespondFollow) => {
    const followerId = this.toObjectId(respondFollow.follower);
    const followingId = this.toObjectId(respondFollow.following);

    const followRequest = await this.followRepository.getOne({
      follower: followerId,
      following: followingId,
      status: FollowStatus.PENDING,
    });

    if (!followRequest) {
      throw new AppError("Follow request not found or already handled", 404);
    }

    if (respondFollow.action === "accept") {
      followRequest.status = FollowStatus.ACCEPTED;
      await followRequest.save();
      await this.adjustFollowCounts(followerId, followingId, 1);

      return followRequest;
    }

    if (respondFollow.action === "reject") {
      await followRequest.deleteOne();
      return { success: true };
    }

    throw new AppError("Invalid response action", 400);
  };

  getPendingRequests = async (userId: string, query: PaginateDto) => {
    const { data, total, page, limit, totalPages } = await this.paginate(
      {
        following: userId,
        status: FollowStatus.PENDING,
      },
      query,
    );
    const metaData = {
      total,
      page,
      limit,
      totalPages,
    };
    return { data, metaData };
  };

  getList = async (
    targetUserId: string,
    currentUserId: string,
    type: "followers" | "following",
    query: PaginateDto,
  ) => {
    const targetId = this.toObjectId(targetUserId);
    const currentId = this.toObjectId(currentUserId);

    const targetUser = await this.findActiveUserOrThrow(targetId);

    await this.assertCanViewPrivateList(
      targetUser.isPrivate,
      targetId,
      currentId,
    );

    const isFollowersList = type === "followers";
    const filter = isFollowersList
      ? { following: targetId, status: FollowStatus.ACCEPTED }
      : { follower: targetId, status: FollowStatus.ACCEPTED };

    const { data, total, page, limit, totalPages } = await this.paginate(
      filter,
      query,
    );
    const metaData = {
      total,
      page,
      limit,
      totalPages,
    };
    return { data, metaData };
  };

  private toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    return id instanceof Types.ObjectId ? id : new Types.ObjectId(id);
  }

  private async paginate(
    filter: Record<string, unknown>,
    { page = 1, limit = 10 }: PaginateDto,
  ): Promise<PaginatedRequests<IFollow>> {
    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.min(50, Number(limit) || 10);
    const { data, total } = await this.followRepository.findPaginated(
      filter,
      page,
      limit,
    );
    return {
      data,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async findActiveUserOrThrow(userId: Types.ObjectId) {
    const user = await this.userRepository.getOne({
      _id: userId,
      isDeleted: false,
    });

    if (!user) {
      throw userErrors.userNotFound;
    }

    return user;
  }

  private async adjustFollowCounts(
    followerId: Types.ObjectId,
    followingId: Types.ObjectId,
    by: number,
  ): Promise<void> {
    await Promise.all([
      this.userRepository.incrementCounter(followerId, "followingCount", by),
      this.userRepository.incrementCounter(followingId, "followersCount", by),
    ]);
  }

  private async assertCanViewPrivateList(
    isPrivate: boolean,
    targetId: Types.ObjectId,
    currentId: Types.ObjectId,
  ): Promise<void> {
    if (!isPrivate || targetId.equals(currentId)) {
      return;
    }

    const isApprovedFollower = await this.followRepository.getOne({
      follower: currentId,
      following: targetId,
      status: FollowStatus.ACCEPTED,
    });

    if (!isApprovedFollower) {
      throw new AppError("This account is private", 403);
    }
  }
}
