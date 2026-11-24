import { QueryFilter, Types } from "mongoose";
import { AbstractRepository } from "../../../lib/db/abstract.repository.js";
import Follow, { FollowStatus } from "../model/follow.model";
import { IFollow } from "../interface/follow.interface.js";
import { injectable } from "tsyringe";
const userPopulate = [
  { path: "follower", select: "username profilePicture" },
  { path: "following", select: "username profilePicture" },
];
injectable();
export class FollowRepository extends AbstractRepository<IFollow> {
  constructor() {
    super(Follow);
  }

  async findPaginated(
    filter: QueryFilter<IFollow>,
    page: number,
    limit: number,
    newestFirst: boolean = true,
  ) {
    const [data, total] = await Promise.all([
      this.getMany(filter, {
        skip: (page - 1) * limit,
        limit,
        sort: { createdAt: newestFirst ? -1 : 1 },
        populate: userPopulate,
      }),
      Follow.countDocuments(filter),
    ]);
    return { data, total };
  }

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
