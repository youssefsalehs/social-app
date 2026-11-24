import { HydratedDocument, QueryFilter } from "mongoose";
import { injectable } from "tsyringe";
import { AbstractRepository } from "../../../lib/db/abstract.repository";
import { IPost } from "../interface/post.interface";
import Post from "../model/post.model";
export type PostDocument = HydratedDocument<IPost>;
const authorPopulate = { path: "userId", select: "username profilePicture" };
@injectable()
export class PostRepository extends AbstractRepository<IPost> {
  constructor() {
    super(Post);
  }

  async findPostsPaginated(
    filter: QueryFilter<IPost>,
    page: number,
    limit: number,
  ) {
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
}
