import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { HabitModel } from "@/models/mongoose/Habit";
import { HabitLogModel } from "@/models/mongoose/HabitLog";
import { Habit } from "@/models/domain/Habit";
import { CreateHabitSchema } from "@/validators";

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

    const habitDocs = await HabitModel.find({ userId }).sort({ createdAt: -1 }).lean();
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

      return {
        id,
        userId: doc.userId,
        title: doc.title,
        description: doc.description,
        frequency: doc.frequency,
        targetDaysPerWeek: doc.targetDaysPerWeek,
        color: doc.color,
        archived: doc.archived,
        streak: habitEntity.calculateStreak(today),
        completedToday: habitEntity.isCompletedToday(today),
        createdAt: doc.createdAt,
      };
    });

    return NextResponse.json({ success: true, data: habits });
  } catch (err) {
    console.error("Error in GET /api/habits:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch habits" } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = CreateHabitSchema.safeParse({ ...body, userId });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: parsed.error.issues[0]?.message || "Invalid payload" } },
        { status: 400 }
      );
    }

    await connectDB();

    const doc = await HabitModel.create({
      userId,
      title: parsed.data.title,
      description: body.description,
      frequency: parsed.data.frequency || "daily",
      targetDaysPerWeek: parsed.data.targetDaysPerWeek || 7,
      color: body.color || "#0284c7",
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: doc._id.toString(),
          userId: doc.userId,
          title: doc.title,
          description: doc.description,
          frequency: doc.frequency,
          targetDaysPerWeek: doc.targetDaysPerWeek,
          color: doc.color,
          archived: doc.archived,
          streak: 0,
          completedToday: false,
          createdAt: doc.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in POST /api/habits:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create habit" } },
      { status: 500 }
    );
  }
}
