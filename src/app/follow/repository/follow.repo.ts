import { Types } from "mongoose";
import { AbstractRepository } from "../../../lib/db/abstract.repository.js";
import Follow, { FollowStatus } from "../model/follow.model";
import { IFollow } from "../interface/follow.interface.js";
import { injectable } from "tsyringe";

injectable();
export class FollowRepository extends AbstractRepository<IFollow> {
  constructor() {
    super(Follow);
  }
  getPendingRequests = async (userId: string) => {
    return await Follow.find({
      following: userId,
      status: FollowStatus.PENDING,
    });
  };
  getFollowList = async (
    filter: object,
    populateField: "follower" | "following",
  ) => {
    return await Follow.find(filter)
      .populate(populateField, "username name profilePicture")
      .sort({ createdAt: -1 })
      .lean();
  };
  acceptAllPendingRequests = async (
    followingId: string,
  ): Promise<Types.ObjectId[]> => {
    const filter = {
      following: new Types.ObjectId(followingId),
      status: FollowStatus.PENDING,
    };

    const pendingRequests = await Follow.find(filter).select("follower");

    if (pendingRequests.length === 0) {
      return [];
    }

    const followerIds = pendingRequests.map((req) => req.follower);

    await Follow.updateMany(filter, { status: FollowStatus.ACCEPTED });

    return followerIds;
  };

  getFollowingIds = async (
    followerId: Types.ObjectId,
  ): Promise<Types.ObjectId[]> => {
    const records = await Follow.find({
      follower: followerId,
      status: FollowStatus.ACCEPTED,
    })
      .select("following")
      .lean();
    return records.map((record) => record.following as Types.ObjectId);
  };

  getFollowerIds = async (
    followingId: Types.ObjectId,
  ): Promise<Types.ObjectId[]> => {
    const records = await Follow.find({
      following: followingId,
      status: FollowStatus.ACCEPTED,
    })
      .select("follower")
      .lean();
    return records.map((record) => record.follower as Types.ObjectId);
  };
}
