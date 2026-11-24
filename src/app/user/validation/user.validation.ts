import { z } from "zod";
import { Gender } from "../../auth/enum/enum";

const allowedKeys = [
  "username",
  "email",
  "dob",
  "gender",
  "phoneNumber",
  "bio",
] as const;

export const UpdateUserDto = z
  .object({
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters"),

    email: z
      .email("Invalid email address")
      .trim()
      .toLowerCase()
      .min(5, "Email must be at least 5 characters"),

    dob: z.coerce.date(),

    gender: z.enum(Gender),

    phoneNumber: z.string().trim(),

    bio: z.string().trim().max(160, "Bio cannot exceed 160 characters"),
  })
  .partial()
  .strict()
  .refine((data) => allowedKeys.some((key) => data[key] !== undefined), {
    message: "At least one updatable field must be provided",
  });
