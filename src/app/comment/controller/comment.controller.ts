import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { CommentService } from "../service/comment.service";
import {
  CreateCommentDto,
  GetCommentsQuery,
  UpdateCommentDto,
} from "../dto/comment.dto";

@injectable()
export class CommentController {
  constructor(
    @inject(TOKENS.CommentService)
    private readonly commentService: CommentService,
  ) {}

  createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await this.commentService.createComment(
        req.body as CreateCommentDto,
        req.user!.id,
        (req.files as Express.Multer.File[]) || [],
      );
      return res
        .status(201)
        .json({
          success: true,
          message: "comment created successfully",
          data: comment,
        });
    } catch (err) {
      return next(err);
    }
  };

  getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comments, metaData } = await this.commentService.getComments(
        req.query as unknown as GetCommentsQuery,
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

  updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await this.commentService.updateComment(
        req.params.id as string,
        req.user!.id,
        req.body as UpdateCommentDto,
      );
      return res
        .status(200)
        .json({
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
