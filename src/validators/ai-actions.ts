import { z } from "zod";

// Base schemas for action payload definitions
export const CreateTaskActionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("CREATE_TASK"),
  entityType: z.literal("task").optional(),
  payload: z.object({
    title: z.string().min(1, "Task title is required").max(200),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    dueDate: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
  reason: z.string().optional(),
  requiresConfirmation: z.boolean().optional(),
});

export const UpdateTaskActionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("UPDATE_TASK"),
  entityType: z.literal("task").optional(),
  payload: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    query: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    status: z.enum(["todo", "in_progress", "completed", "archived"]).optional(),
    dueDate: z.string().optional(),
    description: z.string().optional(),
  }),
  reason: z.string().optional(),
  requiresConfirmation: z.boolean().optional(),
});

export const CompleteTaskActionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("COMPLETE_TASK"),
  entityType: z.literal("task").optional(),
  payload: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    query: z.string().optional(),
  }),
  reason: z.string().optional(),
  requiresConfirmation: z.boolean().optional(),
});

export const CreateHabitActionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("CREATE_HABIT"),
  entityType: z.literal("habit").optional(),
  payload: z.object({
    title: z.string().min(1, "Habit title is required").max(100),
    frequency: z.enum(["daily", "weekly", "custom"]).optional(),
    targetDaysPerWeek: z.number().min(1).max(7).optional(),
  }),
  reason: z.string().optional(),
  requiresConfirmation: z.boolean().optional(),
});

export const CompleteHabitActionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("COMPLETE_HABIT"),
  entityType: z.literal("habit").optional(),
  payload: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    query: z.string().optional(),
    date: z.string().optional(),
  }),
  reason: z.string().optional(),
  requiresConfirmation: z.boolean().optional(),
});

export const CreateNoteActionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("CREATE_NOTE"),
  entityType: z.literal("note").optional(),
  payload: z.object({
    title: z.string().min(1, "Note title is required").max(200),
    content: z.string().optional(),
    type: z.enum(["quick", "document", "journal", "code"]).optional(),
    tags: z.array(z.string()).optional(),
  }),
  reason: z.string().optional(),
  requiresConfirmation: z.boolean().optional(),
});

export const UpdateNoteActionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("UPDATE_NOTE"),
  entityType: z.literal("note").optional(),
  payload: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    query: z.string().optional(),
    content: z.string().optional(),
    appendContent: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
  reason: z.string().optional(),
  requiresConfirmation: z.boolean().optional(),
});

export const CreateGoalActionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("CREATE_GOAL"),
  entityType: z.literal("goal").optional(),
  payload: z.object({
    title: z.string().min(1, "Goal title is required").max(150),
    description: z.string().optional(),
    targetDate: z.string().optional(),
    status: z.enum(["not_started", "in_progress", "achieved", "paused"]).optional(),
  }),
  reason: z.string().optional(),
  requiresConfirmation: z.boolean().optional(),
});

export const UpdateGoalActionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("UPDATE_GOAL"),
  entityType: z.literal("goal").optional(),
  payload: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    query: z.string().optional(),
    status: z.enum(["not_started", "in_progress", "achieved", "paused"]).optional(),
    targetDate: z.string().optional(),
  }),
  reason: z.string().optional(),
  requiresConfirmation: z.boolean().optional(),
});

export const AddGoalMilestoneActionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("ADD_GOAL_MILESTONE"),
  entityType: z.literal("goal").optional(),
  payload: z.object({
    goalId: z.string().optional(),
    goalTitle: z.string().optional(),
    query: z.string().optional(),
    title: z.string().min(1, "Milestone title is required").max(150),
    targetDate: z.string().optional(),
  }),
  reason: z.string().optional(),
  requiresConfirmation: z.boolean().optional(),
});

export const CreateEventActionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("CREATE_EVENT"),
  entityType: z.literal("event").optional(),
  payload: z.object({
    title: z.string().min(1, "Event title is required").max(150),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().optional(),
    type: z.enum(["focus_session", "meeting", "reminder", "personal"]).optional(),
    isAllDay: z.boolean().optional(),
  }),
  reason: z.string().optional(),
  requiresConfirmation: z.boolean().optional(),
});

export const UpdateEventActionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("UPDATE_EVENT"),
  entityType: z.literal("event").optional(),
  payload: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    query: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    type: z.enum(["focus_session", "meeting", "reminder", "personal"]).optional(),
  }),
  reason: z.string().optional(),
  requiresConfirmation: z.boolean().optional(),
});

export const DeleteEventActionSchema = z.object({
  id: z.string().optional(),
  type: z.literal("DELETE_EVENT"),
  entityType: z.literal("event").optional(),
  payload: z.object({
    id: z.string().optional(),
    title: z.string().optional(),
    query: z.string().optional(),
    date: z.string().optional(),
  }),
  reason: z.string().optional(),
  requiresConfirmation: z.literal(true).default(true),
});

// Discriminated union of all supported AI actions
export const SingleAIActionSchema = z.discriminatedUnion("type", [
  CreateTaskActionSchema,
  UpdateTaskActionSchema,
  CompleteTaskActionSchema,
  CreateHabitActionSchema,
  CompleteHabitActionSchema,
  CreateNoteActionSchema,
  UpdateNoteActionSchema,
  CreateGoalActionSchema,
  UpdateGoalActionSchema,
  AddGoalMilestoneActionSchema,
  CreateEventActionSchema,
  UpdateEventActionSchema,
  DeleteEventActionSchema,
]);

export type ValidatedAIAction = z.infer<typeof SingleAIActionSchema>;

// Route payload schema supporting either { action: ... } or { actions: [...] }
export const ExecuteActionRequestSchema = z.union([
  z.object({
    action: SingleAIActionSchema,
  }),
  z.object({
    actions: z.array(SingleAIActionSchema).min(1, "At least one action is required"),
  }),
]);

export type ExecuteActionRequest = z.infer<typeof ExecuteActionRequestSchema>;

/**
 * Validates a single AI action object. Returns parsed action or null.
 */
export function validateAIAction(rawAction: unknown): ValidatedAIAction | null {
  const parse = SingleAIActionSchema.safeParse(rawAction);
  return parse.success ? parse.data : null;
}

/**
 * Validates an array of AI actions. Filters out invalid actions.
 */
export function validateAIActions(rawActions: unknown): ValidatedAIAction[] {
  if (!Array.isArray(rawActions)) return [];
  const valid: ValidatedAIAction[] = [];
  for (const item of rawActions) {
    const res = validateAIAction(item);
    if (res) valid.push(res);
  }
  return valid;
}
