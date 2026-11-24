import { HydratedDocument, QueryFilter } from "mongoose";
import { injectable } from "tsyringe";
import { AbstractRepository } from "../../../lib/db/abstract.repository";
import { IComment } from "../interface/comment.interface";
import Comment from "../model/comment.model";
const authorPopulate = { path: "userId", select: "username profilePicture" };
export type CommentCounter = "reactionsCount";
export type CommentDocument = HydratedDocument<IComment>;
@injectable()
export class CommentRepository extends AbstractRepository<IComment> {
  constructor() {
    super(Comment);
  }

  async findById(id: string, withAuthor: boolean = false) {
    const query = Comment.findById(id);
    if (withAuthor) {
      query.populate(authorPopulate);
    }
    return query.exec();
  }

  async findCommentsPaginated(
    filter: QueryFilter<IComment>,
    page: number,
    limit: number,
    newestFirst: boolean = true,
  ) {
    const [comments, total] = await Promise.all([
      this.getMany(filter, {
        skip: (page - 1) * limit,
        limit,
        sort: { createdAt: newestFirst ? -1 : 1 },
        populate: authorPopulate,
      }),
      Comment.countDocuments(filter),
    ]);
    return { comments, total };
  }

  async deleteWithDescendants(commentId: string): Promise<number> {
    const ids: string[] = [commentId];
    let level: string[] = [commentId];

    while (level.length) {
      const children = await Comment.find({ parentId: { $in: level } })
        .select("_id")
        .lean()
        .exec();

      level = children.map((child) => child._id.toString());
      ids.push(...level);
    }

    const result = await Comment.deleteMany({ _id: { $in: ids } }).exec();
    return result.deletedCount ?? 0;
  }

  async incrementCounter(
    commentId: string,
    field: CommentCounter,
    by: number,
  ): Promise<CommentDocument | null> {
    return this.update(
      { _id: commentId },
      { $inc: { [field]: by } },
      { returnDocument: "after" },
    );
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
