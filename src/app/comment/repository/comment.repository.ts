import { HydratedDocument, QueryFilter } from "mongoose";
import { injectable } from "tsyringe";
import { AbstractRepository } from "../../../lib/db/abstract.repository";
import { IComment } from "../interface/comment.interface";
import Comment from "../model/comment.model";

@injectable()
export class CommentRepository extends AbstractRepository<IComment> {
  constructor() {
    super(Comment);
  }

  async getComments(
    filter: QueryFilter<IComment>,
    { skip, limit }: { skip: number; limit: number },
  ): Promise<[HydratedDocument<IComment>[], number]> {
    const [data, total] = await Promise.all([
      Comment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Comment.countDocuments(filter),
    ]);
    return [data, total];
  }
}
