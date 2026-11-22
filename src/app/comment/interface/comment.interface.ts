import { Types } from "mongoose";

export interface IComment {
  content: string;
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  parentId?: Types.ObjectId;
  reactionsCount: number;
  media?: string[];
}
