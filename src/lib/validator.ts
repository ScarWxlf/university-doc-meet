import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z
      .string()
      .min(1, "Confirm Password is required")
      .min(6, "Confirm Password must be at least 6 characters long"),
  })
  .refine(
    (data) => data.confirmPassword === data.password,
    {
      path: ["confirmPassword"],
      message: "Passwords must match",
    }
  );
