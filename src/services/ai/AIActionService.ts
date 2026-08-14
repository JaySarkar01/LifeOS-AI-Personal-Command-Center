import connectDB from "@/lib/db/mongoose";
import { TaskModel } from "@/models/mongoose/Task";
import { HabitModel } from "@/models/mongoose/Habit";
import { HabitLogModel } from "@/models/mongoose/HabitLog";
import { NoteModel } from "@/models/mongoose/Note";
import { GoalModel } from "@/models/mongoose/Goal";
import { EventModel } from "@/models/mongoose/Event";
import { AIAction, AIActionType, AIActionEntityType } from "@/models/domain/AIAction";
import { ValidatedAIAction, validateAIAction } from "@/validators/ai-actions";
import { AI_CONFIG } from "./ai.config";

// In-memory rate limiting map for AI Actions (behind abstraction for future distributed store)
const actionRateLimits = new Map<string, { count: number; resetTime: number }>();

export class AIActionRateLimiter {
  public static checkLimit(userId: string, limit = AI_CONFIG.maxActionExecutionsPerMinute): boolean {
    const now = Date.now();
    const record = actionRateLimits.get(userId);

    if (!record || now > record.resetTime) {
      actionRateLimits.set(userId, { count: 1, resetTime: now + AI_CONFIG.rateLimitWindowMs });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  }

  public static reset(userId: string): void {
    actionRateLimits.delete(userId);
  }
}

export interface AIActionResult {
  actionId?: string;
  type: AIActionType;
  entityType: AIActionEntityType;
  success: boolean;
  message: string;
  entityId?: string;
  data?: unknown;
  undoable?: boolean;
  statusCode?: number;
}

export class AIActionService {
  /**
   * Validates raw action data against Zod schemas.
   */
  public static validate(rawAction: unknown): ValidatedAIAction | null {
    return validateAIAction(rawAction);
  }

  /**
   * Creates an AIAction domain model preview object.
   */
  public static previewAction(rawAction: unknown): AIAction | null {
    const validated = this.validate(rawAction);
    if (!validated) return null;

    return new AIAction({
      id: validated.id,
      type: validated.type,
      entityType: validated.entityType,
      payload: validated.payload as Record<string, unknown>,
      reason: validated.reason,
      requiresConfirmation: validated.requiresConfirmation,
      status: "proposed",
    });
  }

  /**
   * Executes a validated AI action for an authenticated user with strict ownership checks.
   */
  public static async executeAction(
    userId: string,
    rawAction: unknown
  ): Promise<AIActionResult> {
    const action = this.validate(rawAction);
    if (!action) {
      return {
        type: "CREATE_TASK",
        entityType: "task",
        success: false,
        message: "Invalid action schema or unrecognized action type",
        statusCode: 400,
      };
    }

    if (!AIActionRateLimiter.checkLimit(userId)) {
      return {
        actionId: action.id,
        type: action.type,
        entityType: action.entityType || "task",
        success: false,
        message: "AI action rate limit exceeded. Please wait a moment before confirming actions.",
        statusCode: 429,
      };
    }

    await connectDB();

    switch (action.type) {
      // ----------------------------------------------------
      // 1. TASK ACTIONS
      // ----------------------------------------------------
      case "CREATE_TASK": {
        const { title, description, priority, dueDate, tags } = action.payload;
        const taskDoc = await TaskModel.create({
          userId,
          title: title.trim(),
          description: description || "",
          priority: priority || "medium",
          status: "todo",
          dueDate: dueDate ? new Date(dueDate) : undefined,
          tags: tags || [],
        });

        return {
          actionId: action.id,
          type: action.type,
          entityType: "task",
          success: true,
          message: `Created task "${taskDoc.title}"`,
          entityId: taskDoc._id.toString(),
          data: { id: taskDoc._id.toString(), title: taskDoc.title },
          undoable: true,
          statusCode: 200,
        };
      }

      case "UPDATE_TASK": {
        const { id, title, query, priority, status, dueDate, description } = action.payload;
        let taskDoc = null;

        if (id) {
          taskDoc = await TaskModel.findOne({ _id: id });
          if (!taskDoc) {
            return { actionId: action.id, type: action.type, entityType: "task", success: false, message: "Task not found", statusCode: 404 };
          }
          if (taskDoc.userId.toString() !== userId) {
            return { actionId: action.id, type: action.type, entityType: "task", success: false, message: "Forbidden: Task belongs to another user", statusCode: 403 };
          }
        } else if (title || query) {
          const searchPattern = new RegExp((title || query || "").trim(), "i");
          taskDoc = await TaskModel.findOne({ userId, title: { $regex: searchPattern } });
          if (!taskDoc) {
            return { actionId: action.id, type: action.type, entityType: "task", success: false, message: `No task found matching "${title || query}"`, statusCode: 404 };
          }
        } else {
          return { actionId: action.id, type: action.type, entityType: "task", success: false, message: "Task ID or search title is required", statusCode: 400 };
        }

        if (title) taskDoc.title = title.trim();
        if (description !== undefined) taskDoc.description = description;
        if (priority) taskDoc.priority = priority;
        if (status) taskDoc.status = status;
        if (dueDate !== undefined) taskDoc.dueDate = dueDate ? new Date(dueDate) : undefined;
        await taskDoc.save();

        return {
          actionId: action.id,
          type: action.type,
          entityType: "task",
          success: true,
          message: `Updated task "${taskDoc.title}"`,
          entityId: taskDoc._id.toString(),
          data: { id: taskDoc._id.toString(), title: taskDoc.title, status: taskDoc.status, priority: taskDoc.priority },
          undoable: false,
          statusCode: 200,
        };
      }

      case "COMPLETE_TASK": {
        const { id, title, query } = action.payload;
        let taskDoc = null;

        if (id) {
          taskDoc = await TaskModel.findOne({ _id: id });
          if (!taskDoc) {
            return { actionId: action.id, type: action.type, entityType: "task", success: false, message: "Task not found", statusCode: 404 };
          }
          if (taskDoc.userId.toString() !== userId) {
            return { actionId: action.id, type: action.type, entityType: "task", success: false, message: "Forbidden: Task belongs to another user", statusCode: 403 };
          }
        } else if (title || query) {
          const searchPattern = new RegExp((title || query || "").trim(), "i");
          taskDoc = await TaskModel.findOne({ userId, title: { $regex: searchPattern } });
          if (!taskDoc) {
            return { actionId: action.id, type: action.type, entityType: "task", success: false, message: `No task found matching "${title || query}"`, statusCode: 404 };
          }
        } else {
          return { actionId: action.id, type: action.type, entityType: "task", success: false, message: "Task ID or title is required", statusCode: 400 };
        }

        taskDoc.status = "completed";
        await taskDoc.save();

        return {
          actionId: action.id,
          type: action.type,
          entityType: "task",
          success: true,
          message: `Marked task "${taskDoc.title}" as completed`,
          entityId: taskDoc._id.toString(),
          data: { id: taskDoc._id.toString(), title: taskDoc.title, status: "completed" },
          undoable: true,
          statusCode: 200,
        };
      }

      // ----------------------------------------------------
      // 2. HABIT ACTIONS
      // ----------------------------------------------------
      case "CREATE_HABIT": {
        const { title, frequency, targetDaysPerWeek } = action.payload;
        const habitDoc = await HabitModel.create({
          userId,
          title: title.trim(),
          frequency: frequency || "daily",
          targetDaysPerWeek: targetDaysPerWeek || 7,
          archived: false,
        });

        return {
          actionId: action.id,
          type: action.type,
          entityType: "habit",
          success: true,
          message: `Created habit "${habitDoc.title}"`,
          entityId: habitDoc._id.toString(),
          data: { id: habitDoc._id.toString(), title: habitDoc.title },
          undoable: true,
          statusCode: 200,
        };
      }

      case "COMPLETE_HABIT": {
        const { id, title, query, date } = action.payload;
        let habitDoc = null;

        if (id) {
          habitDoc = await HabitModel.findOne({ _id: id });
          if (!habitDoc) {
            return { actionId: action.id, type: action.type, entityType: "habit", success: false, message: "Habit not found", statusCode: 404 };
          }
          if (habitDoc.userId.toString() !== userId) {
            return { actionId: action.id, type: action.type, entityType: "habit", success: false, message: "Forbidden: Habit belongs to another user", statusCode: 403 };
          }
        } else if (title || query) {
          const searchPattern = new RegExp((title || query || "").trim(), "i");
          habitDoc = await HabitModel.findOne({ userId, title: { $regex: searchPattern }, archived: { $ne: true } });
          if (!habitDoc) {
            return { actionId: action.id, type: action.type, entityType: "habit", success: false, message: `No active habit found matching "${title || query}"`, statusCode: 404 };
          }
        } else {
          return { actionId: action.id, type: action.type, entityType: "habit", success: false, message: "Habit ID or title is required", statusCode: 400 };
        }

        const targetDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingLog = await HabitLogModel.findOne({
          userId,
          habitId: habitDoc._id,
          completedAt: { $gte: startOfDay, $lte: endOfDay },
        });

        if (!existingLog) {
          await HabitLogModel.create({
            userId,
            habitId: habitDoc._id,
            completedAt: targetDate,
          });
        }

        return {
          actionId: action.id,
          type: action.type,
          entityType: "habit",
          success: true,
          message: `Logged completion for habit "${habitDoc.title}"`,
          entityId: habitDoc._id.toString(),
          data: { id: habitDoc._id.toString(), title: habitDoc.title, completedToday: true },
          undoable: true,
          statusCode: 200,
        };
      }

      // ----------------------------------------------------
      // 3. NOTE ACTIONS
      // ----------------------------------------------------
      case "CREATE_NOTE": {
        const { title, content, type, tags } = action.payload;
        const noteDoc = await NoteModel.create({
          userId,
          title: title.trim(),
          content: content || "",
          type: type || "quick",
          tags: tags || [],
        });

        return {
          actionId: action.id,
          type: action.type,
          entityType: "note",
          success: true,
          message: `Created note "${noteDoc.title}"`,
          entityId: noteDoc._id.toString(),
          data: { id: noteDoc._id.toString(), title: noteDoc.title },
          undoable: true,
          statusCode: 200,
        };
      }

      case "UPDATE_NOTE": {
        const { id, title, query, content, appendContent, tags } = action.payload;
        let noteDoc = null;

        if (id) {
          noteDoc = await NoteModel.findOne({ _id: id });
          if (!noteDoc) {
            return { actionId: action.id, type: action.type, entityType: "note", success: false, message: "Note not found", statusCode: 404 };
          }
          if (noteDoc.userId.toString() !== userId) {
            return { actionId: action.id, type: action.type, entityType: "note", success: false, message: "Forbidden: Note belongs to another user", statusCode: 403 };
          }
        } else if (title || query) {
          const searchPattern = new RegExp((title || query || "").trim(), "i");
          noteDoc = await NoteModel.findOne({ userId, title: { $regex: searchPattern } });
          if (!noteDoc) {
            return { actionId: action.id, type: action.type, entityType: "note", success: false, message: `No note found matching "${title || query}"`, statusCode: 404 };
          }
        } else {
          return { actionId: action.id, type: action.type, entityType: "note", success: false, message: "Note ID or title is required", statusCode: 400 };
        }

        if (title) noteDoc.title = title.trim();
        if (content !== undefined) noteDoc.content = content;
        if (appendContent) noteDoc.content = noteDoc.content ? `${noteDoc.content}\n\n${appendContent}` : appendContent;
        if (tags) noteDoc.tags = tags;
        await noteDoc.save();

        return {
          actionId: action.id,
          type: action.type,
          entityType: "note",
          success: true,
          message: `Updated note "${noteDoc.title}"`,
          entityId: noteDoc._id.toString(),
          data: { id: noteDoc._id.toString(), title: noteDoc.title },
          undoable: false,
          statusCode: 200,
        };
      }

      // ----------------------------------------------------
      // 4. GOAL ACTIONS
      // ----------------------------------------------------
      case "CREATE_GOAL": {
        const { title, description, targetDate, status } = action.payload;
        const goalDoc = await GoalModel.create({
          userId,
          title: title.trim(),
          description: description || "",
          targetDate: targetDate ? new Date(targetDate) : undefined,
          status: status || "in_progress",
          milestones: [],
        });

        return {
          actionId: action.id,
          type: action.type,
          entityType: "goal",
          success: true,
          message: `Created goal "${goalDoc.title}"`,
          entityId: goalDoc._id.toString(),
          data: { id: goalDoc._id.toString(), title: goalDoc.title },
          undoable: true,
          statusCode: 200,
        };
      }

      case "UPDATE_GOAL": {
        const { id, title, query, status, targetDate } = action.payload;
        let goalDoc = null;

        if (id) {
          goalDoc = await GoalModel.findOne({ _id: id });
          if (!goalDoc) {
            return { actionId: action.id, type: action.type, entityType: "goal", success: false, message: "Goal not found", statusCode: 404 };
          }
          if (goalDoc.userId.toString() !== userId) {
            return { actionId: action.id, type: action.type, entityType: "goal", success: false, message: "Forbidden: Goal belongs to another user", statusCode: 403 };
          }
        } else if (title || query) {
          const searchPattern = new RegExp((title || query || "").trim(), "i");
          goalDoc = await GoalModel.findOne({ userId, title: { $regex: searchPattern } });
          if (!goalDoc) {
            return { actionId: action.id, type: action.type, entityType: "goal", success: false, message: `No goal found matching "${title || query}"`, statusCode: 404 };
          }
        } else {
          return { actionId: action.id, type: action.type, entityType: "goal", success: false, message: "Goal ID or title is required", statusCode: 400 };
        }

        if (title) goalDoc.title = title.trim();
        if (status) goalDoc.status = status;
        if (targetDate !== undefined) goalDoc.targetDate = targetDate ? new Date(targetDate) : undefined;
        await goalDoc.save();

        return {
          actionId: action.id,
          type: action.type,
          entityType: "goal",
          success: true,
          message: `Updated goal "${goalDoc.title}"`,
          entityId: goalDoc._id.toString(),
          data: { id: goalDoc._id.toString(), title: goalDoc.title, status: goalDoc.status },
          undoable: false,
          statusCode: 200,
        };
      }

      case "ADD_GOAL_MILESTONE": {
        const { goalId, goalTitle, query, title, targetDate } = action.payload;
        let goalDoc = null;

        if (goalId) {
          goalDoc = await GoalModel.findOne({ _id: goalId });
          if (!goalDoc) {
            return { actionId: action.id, type: action.type, entityType: "goal", success: false, message: "Goal not found", statusCode: 404 };
          }
          if (goalDoc.userId.toString() !== userId) {
            return { actionId: action.id, type: action.type, entityType: "goal", success: false, message: "Forbidden: Goal belongs to another user", statusCode: 403 };
          }
        } else if (goalTitle || query) {
          const searchPattern = new RegExp((goalTitle || query || "").trim(), "i");
          goalDoc = await GoalModel.findOne({ userId, title: { $regex: searchPattern } });
          if (!goalDoc) {
            return { actionId: action.id, type: action.type, entityType: "goal", success: false, message: `No goal found matching "${goalTitle || query}"`, statusCode: 404 };
          }
        } else {
          return { actionId: action.id, type: action.type, entityType: "goal", success: false, message: "Target goal is required to add milestone", statusCode: 400 };
        }

        const newMilestone = {
          id: `ms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          title: title.trim(),
          completed: false,
          targetDate: targetDate ? new Date(targetDate) : undefined,
        };

        goalDoc.milestones = goalDoc.milestones || [];
        goalDoc.milestones.push(newMilestone);
        await goalDoc.save();

        return {
          actionId: action.id,
          type: action.type,
          entityType: "goal",
          success: true,
          message: `Added milestone "${title}" to goal "${goalDoc.title}"`,
          entityId: goalDoc._id.toString(),
          data: { goalId: goalDoc._id.toString(), milestone: newMilestone },
          undoable: true,
          statusCode: 200,
        };
      }

      // ----------------------------------------------------
      // 5. EVENT ACTIONS
      // ----------------------------------------------------
      case "CREATE_EVENT": {
        const { title, startTime, endTime, type, isAllDay } = action.payload;
        const start = new Date(startTime);
        let end = endTime ? new Date(endTime) : new Date(start.getTime() + 60 * 60 * 1000); // default 1 hour
        if (end < start) {
          end = new Date(start.getTime() + 60 * 60 * 1000);
        }

        const eventDoc = await EventModel.create({
          userId,
          title: title.trim(),
          startTime: start,
          endTime: end,
          type: type || "personal",
          isAllDay: isAllDay || false,
        });

        return {
          actionId: action.id,
          type: action.type,
          entityType: "event",
          success: true,
          message: `Scheduled event "${eventDoc.title}"`,
          entityId: eventDoc._id.toString(),
          data: { id: eventDoc._id.toString(), title: eventDoc.title, startTime: eventDoc.startTime },
          undoable: true,
          statusCode: 200,
        };
      }

      case "UPDATE_EVENT": {
        const { id, title, query, startTime, endTime, type } = action.payload;
        let eventDoc = null;

        if (id) {
          eventDoc = await EventModel.findOne({ _id: id });
          if (!eventDoc) {
            return { actionId: action.id, type: action.type, entityType: "event", success: false, message: "Event not found", statusCode: 404 };
          }
          if (eventDoc.userId.toString() !== userId) {
            return { actionId: action.id, type: action.type, entityType: "event", success: false, message: "Forbidden: Event belongs to another user", statusCode: 403 };
          }
        } else if (title || query) {
          const searchPattern = new RegExp((title || query || "").trim(), "i");
          eventDoc = await EventModel.findOne({ userId, title: { $regex: searchPattern } });
          if (!eventDoc) {
            return { actionId: action.id, type: action.type, entityType: "event", success: false, message: `No event found matching "${title || query}"`, statusCode: 404 };
          }
        } else {
          return { actionId: action.id, type: action.type, entityType: "event", success: false, message: "Event ID or title is required", statusCode: 400 };
        }

        if (title) eventDoc.title = title.trim();
        if (startTime) eventDoc.startTime = new Date(startTime);
        if (endTime) eventDoc.endTime = new Date(endTime);
        if (type) eventDoc.type = type;
        await eventDoc.save();

        return {
          actionId: action.id,
          type: action.type,
          entityType: "event",
          success: true,
          message: `Updated event "${eventDoc.title}"`,
          entityId: eventDoc._id.toString(),
          data: { id: eventDoc._id.toString(), title: eventDoc.title },
          undoable: false,
          statusCode: 200,
        };
      }

      case "DELETE_EVENT": {
        const { id, title, query } = action.payload;
        let eventDoc = null;

        if (id) {
          eventDoc = await EventModel.findOne({ _id: id });
          if (!eventDoc) {
            return { actionId: action.id, type: action.type, entityType: "event", success: false, message: "Event not found", statusCode: 404 };
          }
          if (eventDoc.userId.toString() !== userId) {
            return { actionId: action.id, type: action.type, entityType: "event", success: false, message: "Forbidden: Event belongs to another user", statusCode: 403 };
          }
        } else if (title || query) {
          const searchPattern = new RegExp((title || query || "").trim(), "i");
          eventDoc = await EventModel.findOne({ userId, title: { $regex: searchPattern } });
          if (!eventDoc) {
            return { actionId: action.id, type: action.type, entityType: "event", success: false, message: `No event found matching "${title || query}"`, statusCode: 404 };
          }
        } else {
          return { actionId: action.id, type: action.type, entityType: "event", success: false, message: "Event ID or title is required", statusCode: 400 };
        }

        await EventModel.deleteOne({ _id: eventDoc._id, userId });

        return {
          actionId: action.id,
          type: action.type,
          entityType: "event",
          success: true,
          message: `Deleted event "${eventDoc.title}"`,
          entityId: eventDoc._id.toString(),
          undoable: false,
          statusCode: 200,
        };
      }

      default:
        return {
          actionId: (action as { id?: string }).id,
          type: (action as { type: AIActionType }).type,
          entityType: "task",
          success: false,
          message: "Unsupported action execution",
          statusCode: 400,
        };
    }
  }

  /**
   * Executes a batch of AI actions with isolated error handling.
   */
  public static async executeActions(
    userId: string,
    actions: unknown[]
  ): Promise<AIActionResult[]> {
    const results: AIActionResult[] = [];
    for (const rawAction of actions) {
      const result = await this.executeAction(userId, rawAction);
      results.push(result);
    }
    return results;
  }

  /**
   * Undoes an action if safe and deterministic.
   */
  public static async undoAction(
    userId: string,
    actionType: AIActionType,
    entityId: string
  ): Promise<{ success: boolean; message: string }> {
    await connectDB();

    switch (actionType) {
      case "CREATE_TASK": {
        const deleted = await TaskModel.findOneAndDelete({ _id: entityId, userId });
        return { success: !!deleted, message: deleted ? "Reversed task creation" : "Task not found" };
      }
      case "COMPLETE_TASK": {
        const task = await TaskModel.findOneAndUpdate(
          { _id: entityId, userId },
          { $set: { status: "todo" } }
        );
        return { success: !!task, message: task ? "Marked task as todo" : "Task not found" };
      }
      case "CREATE_HABIT": {
        const deleted = await HabitModel.findOneAndDelete({ _id: entityId, userId });
        return { success: !!deleted, message: deleted ? "Reversed habit creation" : "Habit not found" };
      }
      case "COMPLETE_HABIT": {
        const deleted = await HabitLogModel.findOneAndDelete({ habitId: entityId, userId });
        return { success: !!deleted, message: deleted ? "Removed habit completion log" : "Log not found" };
      }
      case "CREATE_NOTE": {
        const deleted = await NoteModel.findOneAndDelete({ _id: entityId, userId });
        return { success: !!deleted, message: deleted ? "Reversed note creation" : "Note not found" };
      }
      case "CREATE_GOAL": {
        const deleted = await GoalModel.findOneAndDelete({ _id: entityId, userId });
        return { success: !!deleted, message: deleted ? "Reversed goal creation" : "Goal not found" };
      }
      case "CREATE_EVENT": {
        const deleted = await EventModel.findOneAndDelete({ _id: entityId, userId });
        return { success: !!deleted, message: deleted ? "Reversed event creation" : "Event not found" };
      }
      default:
        return { success: false, message: "Deterministic undo is not supported for this action type" };
    }
  }
}
