import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { PostService } from "../service/post.service";
import { CreatePostDto, UpdatePostDto, GetPostsQuery } from "../dto/post.dto";

@injectable()
export class PostController {
  constructor(
    @inject(TOKENS.PostService)
    private readonly postService: PostService,
  ) {}

  createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      const post = await this.postService.createPost(
        req.body as CreatePostDto,
        req.user!.id,
        files,
      );
      return res.status(201).json({ success: true, data: post });
    } catch (err) {
      return next(err);
    }
  };

  getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await this.postService.getPost(req.params.id as string);
      return res.status(200).json({ success: true, data: post });
    } catch (err) {
      return next(err);
    }
  };

  getPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { posts, metaData } = await this.postService.getPosts(
        req.query as unknown as GetPostsQuery,
      );
      console.log(req.query);
      return res.status(200).json({ success: true, data: posts, metaData });
    } catch (err) {
      return next(err);
    }
  };

  updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await this.postService.updatePost(
        req.params.id as string,
        req.user!.id,
        req.body as UpdatePostDto,
      );
      return res.status(200).json({ success: true, data: post });
    } catch (err) {
      return next(err);
    }
  };

  softDeletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.postService.softDeletePost(
        req.params.id as string,
        req.user!.id,
      );
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };

  hardDeletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.postService.hardDeletePost(
        req.params.id as string,
        req.user!.id,
      );
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };
}
