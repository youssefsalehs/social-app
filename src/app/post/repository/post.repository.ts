import { HydratedDocument, QueryFilter } from "mongoose";
import { injectable } from "tsyringe";
import { AbstractRepository } from "../../../lib/db/abstract.repository";
import { IPost } from "../interface/post.interface";
import Post from "../model/post.model";

@injectable()
export class PostRepository extends AbstractRepository<IPost> {
  constructor() {
    super(Post);
  }

  async getPosts(
    filter: QueryFilter<IPost>,
    { skip, limit }: { skip: number; limit: number },
  ): Promise<[HydratedDocument<IPost>[], number]> {
    const [data, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(filter),
    ]);
    return [data, total];
  }
}
