import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const workspaceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(255),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().optional(),
  priority: z.enum(["urgent", "high", "medium", "low", "none"]).default("none"),
  columnId: z.string().uuid().optional(),
  dueDate: z.string().optional(),
  assigneeIds: z.array(z.string().uuid()).optional(),
  labelIds: z.array(z.string().uuid()).optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

export const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member"]).default("member"),
});

export const documentSchema = z.object({
  title: z.string().min(1).max(500).default("Untitled"),
  content: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  icon: z.string().optional(),
  coverImageUrl: z.string().url().optional().nullable(),
});

export const columnSchema = z.object({
  name: z.string().min(1, "Column name is required").max(255),
  color: z.string().optional(),
  wipLimit: z.number().int().positive().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type WorkspaceInput = z.infer<typeof workspaceSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
export type DocumentInput = z.infer<typeof documentSchema>;
export type ColumnInput = z.infer<typeof columnSchema>;
