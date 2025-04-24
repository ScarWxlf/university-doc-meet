import { z } from "zod";

export const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
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

export const profileUpdateSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) =>
      (!data.password && !data.confirmPassword) || data.password === data.confirmPassword,
    {
      path: ["confirmPassword"],
      message: "Passwords must match",
    }
  )
  .refine(
    (data) =>
      !data.password || data.password.length >= 6,
    {
      path: ["password"],
      message: "Password must be at least 6 characters long",
    }
  );
