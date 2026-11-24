import { Types } from "mongoose";
import z from "zod";
const content = z
  .string()
  .trim()
  .min(1, "Content must be at least 1 character")
  .max(500, "Content must be at most 500 characters");
const objectIdSchema = z
  .string()
  .trim()
  .refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });
export const CreateCommentDto = z.object({
  content,
  postId: objectIdSchema,
  parentId: objectIdSchema.optional(),
});

export const UpdateCommentDto = z.object({
  content,
});
