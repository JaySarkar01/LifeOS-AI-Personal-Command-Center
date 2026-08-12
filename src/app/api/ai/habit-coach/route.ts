import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import connectToDatabase from "@/lib/db/mongoose";
import { HabitModel } from "@/models/mongoose/Habit";
import { HabitLogModel } from "@/models/mongoose/HabitLog";
import { Habit } from "@/models/domain/Habit";
import { GeminiService } from "@/services/ai/GeminiService";
import { z } from "zod";

const HabitCoachSchema = z.object({
  habitId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parse = HabitCoachSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: "habitId required" }, { status: 400 });
    }

    await connectToDatabase();
    const habitDoc = await HabitModel.findOne({ _id: parse.data.habitId, userId }).lean();
    if (!habitDoc) {
      return NextResponse.json({ success: false, error: "Habit not found or access denied" }, { status: 404 });
    }

    const logDocs = await HabitLogModel.find({ userId, habitId: parse.data.habitId }).lean();
    const habitEntity = new Habit({
      id: habitDoc._id.toString(),
      userId: habitDoc.userId.toString(),
      title: habitDoc.title,
      completionLogs: logDocs.map((l) => new Date(l.completedAt)),
    });

    const streak = habitEntity.calculateStreak(new Date());
    const advice = await GeminiService.coachHabit(userId, {
      title: habitDoc.title,
      frequency: habitDoc.frequency,
      streak,
      totalCompletions: logDocs.length,
    });

    return NextResponse.json({ success: true, data: advice });
  } catch (err) {
    console.error("AI Habit Coach Error:", err);
    return NextResponse.json({ success: false, error: "Habit coach service failure" }, { status: 500 });
  }
}
