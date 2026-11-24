import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import {
  CreateCommentDto,
  PaginateDto,
  UpdateCommentDto,
} from "../dto/comment.dto";
import { CommentService } from "../service/comment.service";

@injectable()
export class CommentController {
  constructor(
    @inject(TOKENS.CommentService)
    private readonly commentService: CommentService,
  ) {}

  getCommentReplies = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const { comments, metaData } = await this.commentService.getReplies(
        id as string,
        req.query as unknown as PaginateDto,
      );
      return res.status(200).json({ success: true, data: comments, metaData });
    } catch (err) {
      return next(err);
    }
  };
  getCommentsForPost = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { comments, metaData } = await this.commentService.getComments(
        req.params.postId as string,
        req.query as unknown as PaginateDto,
      );
      return res.status(200).json({ success: true, data: comments, metaData });
    } catch (err) {
      return next(err);
    }
  };

  getComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await this.commentService.getComment(
        req.params.id as string,
      );
      return res.status(200).json({ success: true, data: comment });
    } catch (err) {
      return next(err);
    }
  };
  createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await this.commentService.createComment(
        req.body as CreateCommentDto,
        req.user!.id,
        (req.files as Express.Multer.File[]) || [],
      );
      return res.status(201).json({
        success: true,
        message: "comment created successfully",
        data: comment,
      });
    } catch (err) {
      return next(err);
    }
  };
  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await this.commentService.updateComment(
        req.params.id as string,
        req.user!.id,
        req.body as UpdateCommentDto,
      );
      return res.status(200).json({
        success: true,
        message: "updated comment successfully",
        data: comment,
      });
    } catch (err) {
      return next(err);
    }
  };

  deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.commentService.deleteComment(
        req.params.id as string,
        req.user!.id,
      );
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  };
}
