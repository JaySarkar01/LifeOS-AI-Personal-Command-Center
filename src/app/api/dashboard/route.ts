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
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const eventDocs = await EventModel.find({
      userId,
      startTime: { $gte: startOfToday },
    })
      .sort({ startTime: 1 })
      .limit(6)
      .lean();

    const events = eventDocs.map((e) => ({
      id: e._id.toString(),
      title: e.title,
      startTime: e.startTime,
      endTime: e.endTime,
      type: e.type,
    }));

    // 5. Calculate Real 7-Day Weekly Productivity Overview
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyActivity: Array<{ day: string; date: string; score: number; active: boolean; tasksCount: number; habitsCount: number }> = [];

    const now = new Date();
    const todayDayIndex = now.getDay();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = dayNames[d.getDay()];

      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      // Count tasks completed on this day
      const completedTasksOnDay = taskDocs.filter((t) => {
        if (t.status !== "completed") return false;
        const updated = new Date(t.updatedAt);
        return updated >= dayStart && updated <= dayEnd;
      }).length;

      // Count habit logs completed on this day
      const completedHabitsOnDay = logDocs.filter((log) => {
        const logDate = new Date(log.completedAt);
        return logDate >= dayStart && logDate <= dayEnd;
      }).length;

      // Calculate an honest score (0-100) based on completed activity
      const totalActivities = completedTasksOnDay + completedHabitsOnDay;
      const score = Math.min(100, totalActivities * 25);

      weeklyActivity.push({
        day: dayName,
        date: dateStr,
        score,
        active: d.getDay() === todayDayIndex,
        tasksCount: completedTasksOnDay,
        habitsCount: completedHabitsOnDay,
      });
    }

    const totalWeeklyScore = weeklyActivity.reduce((acc, curr) => acc + curr.score, 0);
    const avgWeeklyScore = Math.round(totalWeeklyScore / 7);

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
          totalGoals: goalDocs.length,
          avgWeeklyScore,
        },
        weeklyActivity,
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
