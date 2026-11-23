import { NextFunction, Response, Request } from "express";
import { ZodType } from "zod";
import { AppError } from "../../pkg/error/error";

export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors: string[] = [];
      const result = schema.safeParse(req.body);
      if (!result.success) {
        errors.push(
          ...result.error.issues.map(
            (issue) =>
              `${issue.path.length ? "." + issue.path.join(" - ") : ""} : ${issue.message}`,
          ),
        );
        throw new AppError(errors.join(" - "), 400);
      }
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}
