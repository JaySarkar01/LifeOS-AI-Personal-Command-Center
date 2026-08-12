import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { HabitModel } from "@/models/mongoose/Habit";
import { HabitLogModel } from "@/models/mongoose/HabitLog";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { id: habitId } = await params;
    await connectDB();

    const habit = await HabitModel.findOne({ _id: habitId, userId });
    if (!habit) {
      return NextResponse.json(
        { success: false, error: { message: "Habit not found" } },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const targetDate = body.date ? new Date(body.date) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingLog = await HabitLogModel.findOne({
      userId,
      habitId,
      completedAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingLog) {
      await HabitLogModel.deleteOne({ _id: existingLog._id });
      return NextResponse.json({ success: true, data: { habitId, completed: false } });
    }

    await HabitLogModel.create({
      userId,
      habitId,
      completedAt: targetDate,
    });

    return NextResponse.json({ success: true, data: { habitId, completed: true } });
  } catch (err) {
    console.error("Error in POST /api/habits/[id]/log:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to log habit completion" } },
      { status: 500 }
    );
  }
}
