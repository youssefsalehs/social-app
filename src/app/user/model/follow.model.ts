import { model, Schema, Types } from "mongoose";
import { IFollow } from "../interface/follow.interface";

export enum FollowStatus {
  PENDING = 0,
  ACCEPTED = 1,
}

const followSchema = new Schema<IFollow>(
  {
    follower: { type: Types.ObjectId, ref: "User", required: true },
    following: { type: Types.ObjectId, ref: "User", required: true },
    status: {
      type: Number,
      enum: FollowStatus,
      default: FollowStatus.ACCEPTED,
    },
  },
  { timestamps: true },
);

const Follow = model<IFollow>("Follow", followSchema);
export default Follow;
