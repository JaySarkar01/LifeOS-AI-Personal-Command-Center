import connectToDatabase from "@/lib/db/mongoose";
import { TaskModel } from "@/models/mongoose/Task";
import { HabitModel } from "@/models/mongoose/Habit";
import { HabitLogModel } from "@/models/mongoose/HabitLog";
import { GoalModel } from "@/models/mongoose/Goal";
import { EventModel } from "@/models/mongoose/Event";
import { NoteModel } from "@/models/mongoose/Note";
import { UserModel } from "@/models/mongoose/User";
import { Habit } from "@/models/domain/Habit";
import { LifeOSTodayContext } from "./types/ai";

export class LifeOSContextService {
  /**
   * Retrieves sanitized, user-isolated context for today's tasks, habits, goals, and events.
   */
  public static async getTodayContext(userId: string): Promise<LifeOSTodayContext> {
    await connectToDatabase();

    const userDoc = await UserModel.findById(userId).lean();
    const userName = userDoc?.name || "User";

    // 1. Tasks
    const taskDocs = await TaskModel.find({ userId, status: { $ne: "completed" } })
      .sort({ priority: -1, createdAt: -1 })
      .limit(10)
      .lean();

    const tasks = taskDocs.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.toISOString().split("T")[0] : undefined,
    }));

    // 2. Habits
    const habitDocs = await HabitModel.find({ userId, archived: { $ne: true } }).lean();
    const habitIds = habitDocs.map((h) => h._id.toString());
    const logDocs = await HabitLogModel.find({ userId, habitId: { $in: habitIds } }).lean();

    const logsByHabit = new Map<string, Date[]>();
    for (const log of logDocs) {
      const hId = log.habitId.toString();
      const existing = logsByHabit.get(hId) || [];
      existing.push(new Date(log.completedAt));
      logsByHabit.set(hId, existing);
    }

    const today = new Date();
    const habits = habitDocs.map((h) => {
      const hId = h._id.toString();
      const habitEntity = new Habit({
        id: hId,
        userId: h.userId.toString(),
        title: h.title,
        completionLogs: logsByHabit.get(hId) || [],
      });

      return {
        id: hId,
        title: h.title,
        streak: habitEntity.calculateStreak(today),
        completedToday: habitEntity.isCompletedToday(today),
      };
    });

    // 3. Goals
    const goalDocs = await GoalModel.find({ userId, status: { $ne: "achieved" } }).lean();
    const goals = goalDocs.map((g) => {
      const total = g.milestones?.length || 0;
      const completed = g.milestones?.filter((m) => m.completed).length || 0;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        id: g._id.toString(),
        title: g.title,
        progress,
        status: g.status,
      };
    });

    // 4. Schedule
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const eventDocs = await EventModel.find({
      userId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ startTime: 1 })
      .lean();

    const schedule = eventDocs.map((e) => ({
      id: e._id.toString(),
      title: e.title,
      startTime: new Date(e.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      endTime: new Date(e.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: e.type,
    }));

    return {
      date: new Date().toISOString().split("T")[0],
      userName,
      tasks,
      habits,
      goals,
      schedule,
    };
  }

  /**
   * Retrieves single note content securely verified by userId.
   */
  public static async getNoteContext(userId: string, noteId: string) {
    await connectToDatabase();
    const note = await NoteModel.findOne({ _id: noteId, userId }).lean();
    if (!note) return null;
    return {
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      tags: note.tags,
      createdAt: note.createdAt,
    };
  }
}
