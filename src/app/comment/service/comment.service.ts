import { Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { ICloudProvider } from "../../../pkg/cloud/cloud.interface";
import { AppError } from "../../../pkg/error/error";
import * as postErrors from "../../post/errors";
import { PostRepository } from "../../post/repository/post.repository";
import {
  CreateCommentDto,
  PaginatedComments,
  PaginateDto,
  UpdateCommentDto,
} from "../dto/comment.dto";
import * as commentErrors from "../errors";
import { IComment } from "../interface/comment.interface";
import { CommentRepository } from "../repository/comment.repository";

@injectable()
export class CommentService {
  constructor(
    @inject(TOKENS.CommentRepository)
    private readonly commentRepository: CommentRepository,
    @inject(TOKENS.PostRepository)
    private readonly postRepository: PostRepository,
    @inject(TOKENS.S3CloudProvider)
    private readonly cloudProvider: ICloudProvider,
  ) {}
  private paginate = async (
    filter: Record<string, unknown>,
    { page = 1, limit = 10 }: PaginateDto,
  ): Promise<PaginatedComments<IComment>> => {
    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.min(50, Number(limit) || 10);
    const { comments, total } =
      await this.commentRepository.findCommentsPaginated(filter, page, limit);
    return {
      comments,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / limit),
    };
  };
  private async getPostForComment(postId: string) {
    const post = await this.postRepository.getOne({
      _id: new Types.ObjectId(postId),
      isDeleted: false,
    });
    if (!post) {
      throw postErrors.postNotFound;
    }
    if (!post.allowsComments) {
      throw commentErrors.commentsDisabled;
    }
    return post;
  }

  getComments = async (postId: string, query: PaginateDto) => {
    if (!postId) {
      throw new AppError("postId is required", 400);
    }
    const { comments, total, page, limit, totalPages } = await this.paginate(
      {
        postId: new Types.ObjectId(postId),
        parentId: { $exists: false },
      },
      query,
    );

    const metaData = {
      total,
      page,
      limit,
      totalPages,
    };
    return { comments, metaData };
  };

  getReplies = async (commentId: string, query: PaginateDto) => {
    const { comments, total, page, limit, totalPages } = await this.paginate(
      {
        parentId: new Types.ObjectId(commentId),
      },
      query,
    );

    const metaData = {
      total,
      page,
      limit,
      totalPages,
    };
    return { comments, metaData };
  };

  getComment = async (commentId: string) => {
    const comment = await this.commentRepository.getOne({
      _id: new Types.ObjectId(commentId),
    });
    if (!comment) {
      throw commentErrors.commentNotFound;
    }
    return comment;
  };

  createComment = async (
    dto: CreateCommentDto,
    userId: string,
    files: Express.Multer.File[] = [],
  ) => {
    const post = await this.getPostForComment(dto.postId);

    let parentId: Types.ObjectId | undefined;
    if (dto.parentId) {
      const parent = await this.commentRepository.getOne({
        _id: new Types.ObjectId(dto.parentId),
        postId: new Types.ObjectId(dto.postId),
      });
      if (!parent) {
        throw commentErrors.commentNotFound;
      }
      parentId = new Types.ObjectId(dto.parentId);
    }

    const mediaKeys: string[] = [];
    for (const file of files) {
      mediaKeys.push(
        await this.cloudProvider.uploadFile(file, `users/${userId}/comments`),
      );
    }

    const comment = await this.commentRepository.create({
      content: dto.content.trim(),
      userId: new Types.ObjectId(userId),
      postId: new Types.ObjectId(dto.postId),
      parentId,
      media: mediaKeys,
    });

    await this.postRepository.incrementCounter(post._id, "commentsCount", 1);
    return comment;
  };

  updateComment = async (
    commentId: string,
    userId: string,
    dto: UpdateCommentDto,
  ) => {
    const comment = await this.commentRepository.getOne({
      _id: new Types.ObjectId(commentId),
    });
    if (!comment) {
      throw commentErrors.commentNotFound;
    }
    if (comment.userId.toString() !== userId) {
      throw commentErrors.commentNotAuthorized;
    }

    const updated = await this.commentRepository.update(
      { _id: new Types.ObjectId(commentId) },
      dto,
      { returnDocument: "after" },
    );
    return updated;
  };

  deleteComment = async (commentId: string, userId: string) => {
    const comment = await this.commentRepository.getOne({
      _id: new Types.ObjectId(commentId),
    });
    if (!comment) {
      throw commentErrors.commentNotFound;
    }

    const post = await this.postRepository.getOne({
      _id: comment.postId,
      isDeleted: false,
    });
    if (!post) {
      throw postErrors.postNotFound;
    }
    const isCommentAuthor = comment.userId.toString() === userId;
    const isPostOwner = post?.userId?.toString() === userId;

    if (!isCommentAuthor && !isPostOwner) {
      throw commentErrors.commentNotAuthorized;
    }

    const deletedCount =
      await this.commentRepository.deleteWithDescendants(commentId);
    const by = -deletedCount;
    await this.postRepository.incrementCounter(post._id, "commentsCount", by);
  };
}
