import { Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { ICloudProvider } from "../../../pkg/cloud/cloud.interface";
import { AppError } from "../../../pkg/error/error";
import { PostRepository } from "../repository/post.repository";
import { CreatePostDto, GetPostsQuery, UpdatePostDto } from "../dto/post.dto";
import * as postErrors from "../errors";

@injectable()
export class PostService {
  constructor(
    @inject(TOKENS.PostRepository)
    private readonly postRepository: PostRepository,
    @inject(TOKENS.S3CloudProvider)
    private readonly cloudProvider: ICloudProvider,
  ) {}

  createPost = async (
    dto: CreatePostDto,
    userId: string,
    files: Express.Multer.File[] = [],
  ) => {
    if ((!dto.content || !dto.content.trim()) && files.length == 0) {
      throw postErrors.invalidPostContent;
    }

    const mediaKeys: string[] = [];
    for (const file of files) {
      const key = await this.cloudProvider.uploadFile(
        file,
        `users/${userId}/posts`,
      );
      mediaKeys.push(key);
    }

    const post = await this.postRepository.create({
      content: dto.content.trim(),
      userId: new Types.ObjectId(userId),
      allowsComments: dto.allowsComments ?? true,
      media: mediaKeys,
    });
    return post;
  };

  getPost = async (postId: string) => {
    const post = await this.postRepository.getOne({
      _id: new Types.ObjectId(postId),
      isDeleted: false,
    });
    if (!post) {
      throw postErrors.postNotFound;
    }
    return post;
  };

  //feed -> latestposts from all people you follow or not
  getPosts = async ({ page = "1", limit = "20" }: GetPostsQuery) => {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (p - 1) * l;
    const [posts, total] = await this.postRepository.getPosts(
      { isDeleted: false },
      { skip, limit: l },
    );
    const metaData = {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
    return { posts, metaData };
  };
  getMyPosts = async (
    userId: string,
    { page = "1", limit = "20" }: GetPostsQuery,
  ) => {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (p - 1) * l;
    const [posts, total] = await this.postRepository.getPosts(
      {
        userId,
        isDeleted: false,
      },
      { skip, limit: l },
    );
    const metaData = {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
    return { posts, metaData };
  };
  getMyHiddenPosts = async (
    userId: string,
    { page = "1", limit = "20" }: GetPostsQuery,
  ) => {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (p - 1) * l;
    const [posts, total] = await this.postRepository.getPosts(
      {
        userId,
        isDeleted: true,
      },
      { skip, limit: l },
    );
    const metaData = {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    };
    return { posts, metaData };
  };
  updatePost = async (postId: string, userId: string, dto: UpdatePostDto) => {
    const post = await this.postRepository.getOne({
      _id: new Types.ObjectId(postId),
      isDeleted: false,
    });
    if (!post) {
      throw postErrors.postNotFound;
    }
    if (post.userId.toString() !== userId) {
      throw postErrors.postNotAuthorized;
    }
    const updates: Record<string, unknown> = {};
    if (dto.content !== undefined) {
      if (!dto.content.trim()) {
        throw postErrors.invalidPostContent;
      }
      updates.content = dto.content.trim();
    }
    if (dto.allowsComments !== undefined) {
      updates.allowsComments = dto.allowsComments;
    }
    if (Object.keys(updates).length === 0) {
      throw new AppError("no valid fields provided for update", 400);
    }
    const updated = await this.postRepository.update(
      { _id: new Types.ObjectId(postId) },
      updates,
      { returnDocument: "after" },
    );
    return updated;
  };

  softDeletePost = async (postId: string, userId: string) => {
    const post = await this.postRepository.getOne({
      _id: new Types.ObjectId(postId),
    });
    if (!post) {
      throw postErrors.postNotFound;
    }
    if (post.userId.toString() !== userId) {
      throw postErrors.postNotAuthorized;
    }

    await this.postRepository.update(
      { _id: new Types.ObjectId(postId) },
      { isDeleted: true },
    );
  };
  hardDeletePost = async (postId: string, userId: string) => {
    const post = await this.postRepository.getOne({
      _id: new Types.ObjectId(postId),
    });
    if (!post) {
      throw postErrors.postNotFound;
    }
    if (post.userId.toString() !== userId) {
      throw postErrors.postNotAuthorized;
    }

    if (post.media && post.media.length > 0) {
      await Promise.all(
        post.media.map((key) => this.cloudProvider.deleteFile(key)),
      );
    }
    await this.postRepository.delete({ _id: new Types.ObjectId(postId) });
  };
}
