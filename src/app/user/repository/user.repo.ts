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
  async updateFollowersCount(userId: Types.ObjectId, amount: 1 | -1) {
    return User.updateOne(
      { _id: userId },
      { $inc: { followersCount: amount } },
    );
  }

  async updateFollowingCount(userId: Types.ObjectId, amount: 1 | -1) {
    return User.updateOne(
      { _id: userId },
      { $inc: { followingCount: amount } },
    );
  }
}

export default new UserRepository();
