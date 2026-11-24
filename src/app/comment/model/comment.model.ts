import { model, Schema, Types } from "mongoose";
import { IComment } from "../interface/comment.interface";

const schema = new Schema<IComment>(
  {
    content: { type: String, required: true, minlength: 1, maxlength: 500 },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    postId: { type: Types.ObjectId, ref: "Post", required: true },
    parentId: { type: Types.ObjectId, ref: "Comment" },
    reactionsCount: { type: Number, default: 0, min: 0 },
    media: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);
schema.index({ postId: 1, parentId: 1, createdAt: -1 });
schema.index({ parentId: 1, createdAt: 1 });
schema.index({ userId: 1 });
const Comment = model<IComment>("Comment", schema);
export default Comment;
