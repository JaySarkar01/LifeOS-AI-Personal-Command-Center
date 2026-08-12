import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { UserModel } from "@/models/mongoose/User";
import { TaskModel } from "@/models/mongoose/Task";
import { HabitModel } from "@/models/mongoose/Habit";
import { HabitLogModel } from "@/models/mongoose/HabitLog";
import { GoalModel } from "@/models/mongoose/Goal";
import { EventModel } from "@/models/mongoose/Event";
import { Habit } from "@/models/domain/Habit";
import { Goal } from "@/models/domain/Goal";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    await connectDB();

    const userDoc = await UserModel.findById(userId).lean();
    const userName = userDoc?.name || userDoc?.email?.split("@")[0] || "User";

    // 1. Fetch Today's Tasks
    const taskDocs = await TaskModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const tasks = taskDocs.map((t) => ({
      id: t._id.toString(),
      userId: t.userId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      estimatedMinutes: t.estimatedMinutes,
      tags: t.tags || [],
    }));

    const totalTasks = taskDocs.length;
    const completedTasks = taskDocs.filter((t) => t.status === "completed").length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 2. Fetch Habits & Calculate Streaks
    const habitDocs = await HabitModel.find({ userId }).lean();
    const habitIds = habitDocs.map((h) => h._id.toString());

    const logDocs = await HabitLogModel.find({
      userId,
      habitId: { $in: habitIds },
    }).lean();

    const logsByHabit = new Map<string, Date[]>();
    for (const log of logDocs) {
      const habitIdStr = log.habitId.toString();
      const existing = logsByHabit.get(habitIdStr) || [];
      existing.push(new Date(log.completedAt));
      logsByHabit.set(habitIdStr, existing);
    }

    const today = new Date();
    let maxStreak = 0;
    let completedHabitsToday = 0;

    const habits = habitDocs.map((doc) => {
      const id = doc._id.toString();
      const logs = logsByHabit.get(id) || [];
      const habitEntity = new Habit({
        id,
        userId: doc.userId.toString(),
        title: doc.title,
        description: doc.description,
        frequency: doc.frequency,
        targetDaysPerWeek: doc.targetDaysPerWeek,
        color: doc.color,
        archived: doc.archived,
        createdAt: doc.createdAt,
        completionLogs: logs,
      });

      const streak = habitEntity.calculateStreak(today);
      if (streak > maxStreak) maxStreak = streak;
      if (habitEntity.isCompletedToday(today)) completedHabitsToday++;

      return {
        id,
        title: doc.title,
        streak,
        completedToday: habitEntity.isCompletedToday(today),
      };
    });

    // 3. Fetch Goals
    const goalDocs = await GoalModel.find({ userId }).lean();
    let totalProgress = 0;

    const goals = goalDocs.map((g) => {
      const goalEntity = new Goal({
        id: g._id.toString(),
        userId: g.userId.toString(),
        title: g.title,
        description: g.description,
        targetDate: g.targetDate,
        status: g.status,
        milestones: g.milestones || [],
      });
      const progress = goalEntity.calculateProgress();
      totalProgress += progress;

      return {
        id: g._id.toString(),
        title: g.title,
        status: g.status,
        progress,
      };
    });

    const overallGoalProgress = goalDocs.length > 0 ? Math.round(totalProgress / goalDocs.length) : 0;

    // 4. Fetch Upcoming Events
    const eventDocs = await EventModel.find({ userId, startTime: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 2) } })
      .sort({ startTime: 1 })
      .limit(5)
      .lean();

    const events = eventDocs.map((e) => ({
      id: e._id.toString(),
      title: e.title,
      startTime: e.startTime,
      endTime: e.endTime,
      type: e.type,
    }));

    return NextResponse.json({
      success: true,
      data: {
        userName,
        summary: {
          completionRate,
          completedTasks,
          totalTasks,
          maxStreak,
          completedHabitsToday,
          totalHabits: habitDocs.length,
          overallGoalProgress,
        },
        tasks,
        habits,
        goals,
        events,
      },
    });
  } catch (err) {
    console.error("Error in GET /api/dashboard:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch dashboard data" } },
      { status: 500 }
    );
  }
}
