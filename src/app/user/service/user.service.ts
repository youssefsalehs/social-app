import { Types } from "mongoose";
import { AppError } from "../../../pkg/error/error";
import { GetProfileDto, UpdateProfileDto } from "../dto/user.dto";
import * as userErrors from "../errors";
import followRepository, { FollowRepository } from "../repository/follow.repo";
import userRepository, { UserRepository } from "./../repository/user.repo";
import { ICloudProvider } from "../../../pkg/cloud/cloud.interface";
import { s3CloudProvider } from "../../../lib/cloud/init";
export class UserService {
  private userRepository: UserRepository = userRepository;
  private followRepository: FollowRepository = followRepository;
  private readonly cloudProvider: ICloudProvider = s3CloudProvider;
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

    const canViewPrivateInfo = isOwnProfile || followStatus === 1;

    return {
      id: targetUser._id,
      username: targetUser.username,
      email: isOwnProfile ? targetUser.email : undefined,
      profilePicture: targetUser.profilePicture,
      coverPicture: targetUser.coverPicture,
      bio: targetUser.bio,
      dob:
        canViewPrivateInfo || !targetUser.isPrivate
          ? targetUser.dob
          : undefined,
      gender: targetUser.gender,
      phoneNumber:
        canViewPrivateInfo || !targetUser.isPrivate
          ? targetUser.phoneNumber
          : undefined,
      isPrivate: targetUser.isPrivate,
      followersCount: targetUser.followersCount,
      followingCount: targetUser.followingCount,
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
}
export default new UserService();
