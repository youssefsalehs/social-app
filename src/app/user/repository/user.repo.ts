import { Types } from "mongoose";
import { AbstractRepository } from "../../../lib/db/abstract.repository.js";
import { IUser } from "../interface/user.interface.js";
import User, { type UserDocument } from "../model/user.model";

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
}

export default new UserRepository();
