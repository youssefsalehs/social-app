import { AbstractRepository } from "../../../lib/db/abstract.repository.js";
import Follow, { FollowStatus } from "../model/follow.model";
import { IFollow } from "./../interface/follow.interface";

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
}

export default new FollowRepository();
