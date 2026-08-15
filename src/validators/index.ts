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

export const CreateJournalEntrySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  mood: z.enum(["great", "good", "neutral", "low", "bad"]).optional(),
  content: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateJournalEntrySchema = CreateJournalEntrySchema.partial().omit({ userId: true, date: true });

export const CreateAccountSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Account name is required").max(100),
  type: z.enum(["checking", "savings", "credit", "cash"]).optional(),
  balance: z.number().optional(),
  currency: z.string().length(3).optional(),
});

export const CreateTransactionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  accountId: z.string().min(1, "Account ID is required"),
  type: z.enum(["income", "expense", "transfer"]).optional(),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  description: z.string().max(250).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  isRecurring: z.boolean().optional(),
});

export const UpdateTransactionSchema = CreateTransactionSchema.partial().omit({ userId: true });

export const CreateBudgetSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  category: z.string().min(1, "Category is required"),
  limit: z.number().positive("Limit must be positive"),
  period: z.enum(["weekly", "monthly", "yearly"]).optional(),
});

