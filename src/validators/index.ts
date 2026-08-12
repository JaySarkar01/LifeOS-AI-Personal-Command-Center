import { z } from "zod";

export const CreateTaskSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "completed", "archived"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.coerce.date().optional(),
  estimatedMinutes: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().omit({ userId: true });

export const CreateHabitSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Title is required").max(100),
  frequency: z.enum(["daily", "weekly", "custom"]).optional(),
  targetDaysPerWeek: z.number().min(1).max(7).optional(),
});

export const CreateGoalSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Title is required").max(150),
  targetDate: z.coerce.date().optional(),
  status: z.enum(["not_started", "in_progress", "achieved", "paused"]).optional(),
});

export const CreateNoteSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().optional(),
  type: z.enum(["quick", "document", "journal", "code"]).optional(),
  tags: z.array(z.string()).optional(),
});

export const CreateEventSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Title is required").max(150),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  type: z.enum(["focus_session", "meeting", "reminder", "personal"]).optional(),
  isAllDay: z.boolean().optional(),
}).refine((data) => data.endTime >= data.startTime, {
  message: "End time must be after or equal to start time",
  path: ["endTime"],
});
