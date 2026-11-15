import { HydratedDocument } from "mongoose";
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
}

export default new UserRepository();
