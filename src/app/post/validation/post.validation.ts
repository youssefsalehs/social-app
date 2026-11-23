import z from "zod";
const content = z
  .string()
  .trim()
  .min(1, "Content must be at least 1 character")
  .max(500, "Content must be at most 500 characters");

export const CreatePostDto = z.object({
  content,
  allowsComments: z.coerce.boolean().optional(),
});

export const UpdatePostDto = z
  .object({
    content: content.optional(),
    allowsComments: z.boolean().optional(),
  })
  .refine(
    (data) => data.content !== undefined || data.allowsComments !== undefined,
    {
      message: "Either content or allowsComments must be provided",
    },
  );
