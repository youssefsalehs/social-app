import { QueryFilter, Types } from "mongoose";
import { AbstractRepository } from "../../../lib/db/abstract.repository.js";
import { IUser } from "../interface/user.interface.js";
import User, { type UserDocument } from "../model/user.model";
import { injectable } from "tsyringe";
import { HydratedDocument } from "mongoose";

@injectable()
export class UserRepository extends AbstractRepository<IUser> {
  constructor() {
    super(User);
  }
  async findByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email });
  }
  async updateFollowersCount(userId: Types.ObjectId, amount: number) {
    return User.updateOne(
      { _id: userId },
      { $inc: { followersCount: amount } },
    );
  }

  async updateFollowingCount(userId: Types.ObjectId, amount: number) {
    return User.updateOne(
      { _id: userId },
      { $inc: { followingCount: amount } },
    );
  }
  bulkIncrementFollowingCount = async (
    userIds: Types.ObjectId[],
    amount: number = 1,
  ) => {
    return await User.updateMany(
      { _id: { $in: userIds } },
      { $inc: { followingCount: amount } },
    );
  };
  async findByUsername(username: string): Promise<UserDocument | null> {
    return User.findOne({
      username: username.toLowerCase(),
      isDeleted: false,
    }).select("-password -__v");
  }
  async getProfiles(
    viewerId: string,
    q: string = "",
    { skip, limit }: { skip: number; limit: number },
  ): Promise<[HydratedDocument<IUser>[], number]> {
    const filter: QueryFilter<IUser> = {};

    ((filter._id = { $ne: viewerId }),
      (filter.$or = [
        { bio: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ]));
    filter.isDeleted = false;
    const [data, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return [data, total];
  }

  async getUsers(
    filter: QueryFilter<IUser>,
    { skip, limit }: { skip: number; limit: number },
  ): Promise<[HydratedDocument<IUser>[], number]> {
    const [data, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    return [data, total];
  }
}

export default new UserRepository();
