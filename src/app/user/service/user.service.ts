import { QueryFilter, Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { ICacheProvider } from "../../../pkg/cache/cache.interface";
import { ICloudProvider } from "../../../pkg/cloud/cloud.interface";
import { AppError } from "../../../pkg/error/error";
import { FollowRepository } from "../../follow/repository/follow.repo";
import {
  GetProfileDto,
  GetProfilesDto,
  GetSuggestionsDto,
  UpdateProfileDto,
} from "../dto/user.dto";
import * as userErrors from "../errors";
import { IUser } from "../interface/user.interface";
import { UserRepository } from "./../repository/user.repo";
@injectable()
export class UserService {
  constructor(
    @inject(TOKENS.UserRepository)
    private readonly userRepository: UserRepository,
    @inject(TOKENS.S3CloudProvider)
    private readonly cloudProvider: ICloudProvider,
    @inject(TOKENS.CacheProvider)
    private readonly cacheProvider: ICacheProvider,
    @inject(TOKENS.FollowRepository) private followRepository: FollowRepository,
  ) {}

  getMe = async (userId: string) => {
    const user = await this.userRepository.getOne({ _id: userId });
    if (!user) {
      throw userErrors.userNotFound;
    }
    user.password = undefined;
    return user;
  };
  private getFollowedIds = async (viewerId: string): Promise<Set<string>> => {
    const records = await this.followRepository.getFollowingIds(
      new Types.ObjectId(viewerId),
    );
    const followedIds = new Set<string>();
    records.forEach((id) => followedIds.add(id.toString()));
    return followedIds;
  };

  getProfiles = async (filters: GetProfilesDto, viewerId: string) => {
    const p = Math.max(1, Number(filters.page) || 1);
    const l = Math.min(100, Math.max(1, Number(filters.limit) || 10));
    const skip = (p - 1) * l;
    const [data, total] = await this.userRepository.getProfiles(
      viewerId,
      filters.q,
      {
        skip,
        limit: l,
      },
    );

    const metaData = {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
    return { profiles: data, metaData };
  };

  getSuggestions = async (viewerId: string, dto: GetSuggestionsDto) => {
    const p = Math.max(1, Number(dto.page) || 1);
    const l = Math.min(100, Math.max(1, Number(dto.limit) || 10));
    const skip = (p - 1) * l;
    console.log(viewerId, dto);
    const followedIds = await this.getFollowedIds(viewerId);

    const filter: QueryFilter<IUser> = {
      _id: { $ne: new Types.ObjectId(viewerId), $nin: [...followedIds] },
      isDeleted: false,
    };
    const [data, total] = await this.userRepository.getUsers(filter, {
      skip,
      limit: l,
    });
    return {
      profiles: data,
      metaData: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      },
    };
  };

  getProfileByUsername = async (getProfileDto: GetProfileDto) => {
    const { username, viewerId } = getProfileDto;
    const targetUser = await this.userRepository.findByUsername(username);
    if (!targetUser) {
      throw userErrors.userNotFound;
    }

    let followStatus = null;
    const isOwnProfile = viewerId
      ? viewerId.toString() === targetUser._id.toString()
      : false;

    if (viewerId && !isOwnProfile) {
      const followRecord = await this.followRepository.getOne({
        follower: viewerId,
        following: targetUser._id,
      });
      if (followRecord) {
        followStatus = followRecord.status;
      }
    }

    return {
      ...targetUser,
      viewerContext: {
        isOwnProfile,
        followStatus,
      },
    };
  };

  updateProfile = async (dto: UpdateProfileDto) => {
    const { userId, data } = dto;

    const existingUser = await this.userRepository.getOne({
      _id: new Types.ObjectId(userId),
    });

    if (!existingUser || existingUser.isDeleted) {
      throw userErrors.userNotFound;
    }

    const {
      password,
      followersCount,
      followingCount,
      isDeleted,
      isVerified,
      provider,
      twoStepVerification,
      isPrivate,
      coverPicture,
      profilePicture,
      ...allowedUpdates
    } = data;

    if (Object.keys(allowedUpdates).length === 0) {
      throw new AppError("No valid fields provided for update", 400);
    }

    if (
      allowedUpdates.username &&
      allowedUpdates.username !== existingUser.username
    ) {
      const usernameTaken = await this.userRepository.getOne({
        username: allowedUpdates.username,
      });
      if (usernameTaken) {
        throw new AppError("Username is already taken", 409);
      }
    }
    if (allowedUpdates.email && allowedUpdates.email !== existingUser.email) {
      const emailTaken = await this.userRepository.getOne({
        email: allowedUpdates.email,
      });
      if (emailTaken) {
        throw new AppError("email is already taken", 409);
      }
    }

    const updatedUser = await this.userRepository.update(
      { _id: new Types.ObjectId(userId) },
      allowedUpdates,
      { returnDocument: "after" },
    );

    return updatedUser;
  };
  toggleProfileVisibility = async (userId: string) => {
    const existingUser = await this.userRepository.getOne({
      _id: new Types.ObjectId(userId),
    });
    if (!existingUser || existingUser.isDeleted) {
      throw userErrors.userNotFound;
    }
    const newIsPrivate = !existingUser.isPrivate;

    await this.userRepository.update(
      { _id: new Types.ObjectId(userId) },
      { isPrivate: newIsPrivate },
    );

    if (existingUser.isPrivate === true && newIsPrivate === false) {
      const acceptedFollowerIds =
        await this.followRepository.acceptAllPendingRequests(userId);

      if (acceptedFollowerIds.length > 0) {
        await Promise.all([
          this.userRepository.updateFollowersCount(
            new Types.ObjectId(userId),
            acceptedFollowerIds.length,
          ),
          this.userRepository.bulkIncrementFollowingCount(
            acceptedFollowerIds,
            1,
          ),
        ]);
      }
    }

    return newIsPrivate;
  };

  uploadProfilePicture = async (file: Express.Multer.File, userId: string) => {
    const key = await this.cloudProvider.uploadFile(
      file,
      `users/${userId}/profile-pictures`,
    );
    this.userRepository.update({ _id: userId }, { profilePicture: key });
  };
  uploadCoverPicture = async (file: Express.Multer.File, userId: string) => {
    const key = await this.cloudProvider.uploadFile(
      file,
      `users/${userId}/cover-pictures`,
    );
    this.userRepository.update({ _id: userId }, { coverPicture: key });
  };
  deleteProfilePicture = async (userId: string) => {
    const user = await this.userRepository.getOne({ _id: userId });
    if (!user?.profilePicture || user.profilePicture === "") {
      throw new AppError("no profile picture found to delete", 404);
    }
    await this.cloudProvider.deleteFile(user?.profilePicture as string);
    await this.userRepository.update(
      { _id: userId },
      { $unset: { profilePicture: "" } },
    );
  };
  deleteCoverPicture = async (userId: string) => {
    const user = await this.userRepository.getOne({ _id: userId });
    if (!user?.coverPicture || user.coverPicture === "") {
      throw new AppError("no cover picture found to delete", 404);
    }
    await this.cloudProvider.deleteFile(user?.coverPicture as string);
    await this.userRepository.update(
      { _id: userId },
      { $unset: { coverPicture: "" } },
    );
  };
  deactivate = async (userId: string) => {
    const user = await this.userRepository.getOne({ _id: userId });
    if (user?.isDeleted) {
      throw userErrors.userNotFound;
    }
    await this.cacheProvider.del(`refreshToken:${userId}`);

    await this.userRepository.update({ _id: userId }, { isDeleted: true });
  };
}
