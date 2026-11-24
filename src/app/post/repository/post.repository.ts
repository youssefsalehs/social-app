import { HydratedDocument, QueryFilter, Types } from "mongoose";
import { injectable } from "tsyringe";
import { AbstractRepository } from "../../../lib/db/abstract.repository";
import { IPost } from "../interface/post.interface";
import Post from "../model/post.model";
export type PostDocument = HydratedDocument<IPost>;
const authorPopulate = { path: "userId", select: "username profilePicture" };
export type PostCounter = "reactionsCount" | "commentsCount";
@injectable()
export class PostRepository extends AbstractRepository<IPost> {
  constructor() {
    super(Post);
  }

  async findPostsPaginated(
    filter: QueryFilter<IPost>,
    page: number,
    limit: number,
  ): Promise<{ posts: PostDocument[]; total: number }> {
    const [posts, total] = await Promise.all([
      this.getMany(filter, {
        skip: (page - 1) * limit,
        limit,
        sort: { createdAt: -1 },
        populate: authorPopulate,
      }),
      Post.countDocuments(filter),
    ]);
    return { posts, total };
  }
  async incrementCounter(
    postId: Types.ObjectId,
    field: PostCounter,
    by: number,
  ): Promise<PostDocument | null> {
    return this.update(
      { _id: postId, isDeleted: false },
      { $inc: { [field]: by } },
      { returnDocument: "after" },
    );
  }
}
