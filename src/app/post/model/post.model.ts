import { model, Schema, Types } from "mongoose";
import { IPost } from "../interface/post.interface";

const schema = new Schema<IPost>(
  {
    content: { type: String, required: true, minlength: 1, maxlength: 500 },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    commentsCount: { type: Number, default: 0, min: 0 },
    reactionsCount: { type: Number, default: 0, min: 0 },
    allowsComments: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    media: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);
schema.index({ userId: 1, createdAt: -1 });
schema.index({ isDeleted: 1, createdAt: -1 });
const Post = model<IPost>("Post", schema);
export default Post;
