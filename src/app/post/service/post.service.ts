import { Types } from "mongoose";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { ICloudProvider } from "../../../pkg/cloud/cloud.interface";
import {
  CreatePostDto,
  PaginatedPosts,
  PaginateDto,
  UpdatePostDto,
} from "../dto/post.dto";
import * as postErrors from "../errors";
import { IPost } from "../interface/post.interface";
import { PostDocument, PostRepository } from "../repository/post.repository";

@injectable()
export class PostService {
  constructor(
    @inject(TOKENS.PostRepository)
    private readonly postRepository: PostRepository,
    @inject(TOKENS.S3CloudProvider)
    private readonly cloudProvider: ICloudProvider,
  ) {}
  private getOwenedPost = async (postId: string, userId: string) => {
    const post = await this.postRepository.getOne({
      _id: new Types.ObjectId(postId),
      isDeleted: false,
    });
    if (!post) {
      throw postErrors.postNotFound;
    }
    this.assertOwnership(post, userId);
    return post;
  };
  private assertOwnership = (post: PostDocument, userId: string) => {
    if (post.userId.toString() !== userId) {
      throw postErrors.postNotAuthorized;
    }
  };

  private paginate = async (
    filter: Record<string, unknown>,
    { page = 1, limit = 10 }: PaginateDto,
  ): Promise<PaginatedPosts<IPost>> => {
    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.min(50, Number(limit) || 10);
    const { posts, total } = await this.postRepository.findPostsPaginated(
      filter,
      page,
      limit,
    );
    return {
      posts,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / limit),
    };
  };

  createPost = async (
    dto: CreatePostDto,
    userId: string,
    files: Express.Multer.File[] = [],
  ) => {
    const mediaKeys: string[] = [];
    for (const file of files) {
      const key = await this.cloudProvider.uploadFile(
        file,
        `users/${userId}/posts`,
      );
      mediaKeys.push(key);
    }

    const post = await this.postRepository.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      media: mediaKeys,
    });
    return post;
  };

  getPost = async (postId: string) => {
    const post = await this.postRepository.getOne(
      {
        _id: new Types.ObjectId(postId),
        isDeleted: false,
      },
      {},
      {
        path: "userId",
        select: "username profilePicture",
      },
    );
    if (!post) {
      throw postErrors.postNotFound;
    }
    return post;
  };

  //feed -> latestposts from all people you follow or not
  getPosts = async (query: PaginateDto) => {
    const { posts, total, page, limit, totalPages } = await this.paginate(
      { isDeleted: false },
      query,
    );

    const metaData = {
      total,
      page,
      limit,
      totalPages,
    };
    return { posts, metaData };
  };

  getActivePosts = async (userId: string, query: PaginateDto) => {
    const { posts, total, page, limit, totalPages } = await this.paginate(
      {
        userId,
        isDeleted: false,
      },
      query,
    );

    const metaData = {
      total,
      page,
      limit,
      totalPages,
    };

    return { posts, metaData };
  };

  getMyHiddenPosts = async (userId: string, query: PaginateDto) => {
    const { posts, total, page, limit, totalPages } = await this.paginate(
      {
        userId,
        isDeleted: true,
      },
      query,
    );

    const metaData = {
      total,
      page,
      limit,
      totalPages,
    };

    return { posts, metaData };
  };
  updatePost = async (postId: string, userId: string, dto: UpdatePostDto) => {
    await this.getOwenedPost(postId, userId);

    const updated = await this.postRepository.update(
      { _id: new Types.ObjectId(postId) },
      dto,
      { returnDocument: "after" },
    );
    return updated;
  };

  softDeletePost = async (postId: string, userId: string) => {
    await this.getOwenedPost(postId, userId);

    await this.postRepository.update(
      { _id: new Types.ObjectId(postId) },
      { isDeleted: true },
    );
  };
  hardDeletePost = async (postId: string, userId: string) => {
    const post = await this.getOwenedPost(postId, userId);
    if (post.media && post.media.length > 0) {
      await Promise.all(
        post.media.map((key) => this.cloudProvider.deleteFile(key)),
      );
    }
    await this.postRepository.delete({ _id: new Types.ObjectId(postId) });
  };
}
