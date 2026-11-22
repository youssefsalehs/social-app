import { Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { ICloudProvider } from "../../../pkg/cloud/cloud.interface";
import { AppError } from "../../../pkg/error/error";
import { PostRepository } from "../../post/repository/post.repository";
import * as postErrors from "../../post/errors";
import { CommentRepository } from "../repository/comment.repository";
import {
  CreateCommentDto,
  GetCommentsQuery,
  UpdateCommentDto,
} from "../dto/comment.dto";
import * as commentErrors from "../errors";

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

  private async getPostForComment(postId: string) {
    const post = await this.postRepository.getOne({
      _id: new Types.ObjectId(postId),
    });
    if (!post) {
      throw postErrors.postNotFound;
    }
    if (!post.allowsComments) {
      throw commentErrors.commentsDisabled;
    }
    return post;
  }

  createComment = async (
    dto: CreateCommentDto,
    userId: string,
    files: Express.Multer.File[] = [],
  ) => {
    if (!dto.postId) {
      throw new AppError("postId is required", 400);
    }
    if (!dto.content || !dto.content.trim()) {
      throw commentErrors.invalidCommentContent;
    }

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

    const updates = {
      commentsCount: post.commentsCount + 1,
    };
    await this.postRepository.update(
      { _id: new Types.ObjectId(dto.postId) },
      updates,
    );
    return comment;
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

  getComments = async ({
    postId,
    page = "1",
    limit = "20",
  }: GetCommentsQuery) => {
    if (!postId) {
      throw new AppError("postId is required", 400);
    }
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (p - 1) * l;
    const [comments, total] = await this.commentRepository.getComments(
      {
        postId: new Types.ObjectId(postId),
      },
      { skip, limit: l },
    );
    const metaData = {
      total,
      limit: l,
      page: p,
      toatlPages: Math.ceil(total / l),
    };
    return { comments, metaData };
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
    const updates: Record<string, unknown> = {};
    if (dto.content !== undefined) {
      if (!dto.content.trim()) {
        throw commentErrors.invalidCommentContent;
      }
      updates.content = dto.content.trim();
    }
    if (Object.keys(updates).length === 0) {
      throw new AppError("no valid fields provided for update", 400);
    }
    const updated = await this.commentRepository.update(
      { _id: new Types.ObjectId(commentId) },
      updates,
      { returnDocument: "after" },
    );
    return updated;
  };

  deleteComment = async (commentId: string, userId: string) => {
    const comment = await this.commentRepository.getOne({
      _id: new Types.ObjectId(commentId),
      isDeleted: false,
    });
    if (!comment) {
      throw commentErrors.commentNotFound;
    }
    if (comment.userId.toString() !== userId) {
      throw commentErrors.commentNotAuthorized;
    }

    await this.commentRepository.delete({ _id: new Types.ObjectId(commentId) });

    const post = await this.postRepository.getOne({
      _id: comment.postId,
    });
    if (post && !post.isDeleted) {
      const updates = {
        commentsCount: Math.max(0, post.commentsCount - 1),
      };
      await this.postRepository.update({ _id: comment.postId }, updates);
    }
  };
}
