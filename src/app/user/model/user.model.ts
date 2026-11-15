import { HydratedDocument, model, Schema } from "mongoose";
import { IUser } from "../interface/user.interface";
import { Gender, Provider } from "../../auth/enum/enum";
export type UserDocument = HydratedDocument<IUser>;
const schema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 5,
      lowercase: true,
    },

    provider: {
      type: Number,
      enum: Provider,
      default: Provider.LOCAL,
    },
    password: {
      type: String,
      minLength: 8,
      required: function (this) {
        return this.provider === Provider.LOCAL;
      },
    },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    dob: Date,
    gender: { type: Number, enum: Gender },
    profilePicture: String,
    twoStepVerification: { type: Boolean, default: false },
    coverPicture: String,
    phoneNumber: String,
    bio: { type: String, trim: true, maxlength: 160, default: "" },
    isPrivate: { type: Boolean, default: false },
    followersCount: { type: Number, default: 0, min: 0 },
    followingCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  },
);
const User = model<IUser>("User", schema);
export default User;
