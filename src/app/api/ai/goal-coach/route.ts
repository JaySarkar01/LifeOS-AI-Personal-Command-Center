import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import connectToDatabase from "@/lib/db/mongoose";
import { GoalModel } from "@/models/mongoose/Goal";
import { GeminiService } from "@/services/ai/GeminiService";
import { z } from "zod";

const GoalCoachSchema = z.object({
  goalId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parse = GoalCoachSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: "goalId required" }, { status: 400 });
    }

    await connectToDatabase();
    const goalDoc = await GoalModel.findOne({ _id: parse.data.goalId, userId }).lean();
    if (!goalDoc) {
      return NextResponse.json({ success: false, error: "Goal not found or access denied" }, { status: 404 });
    }

    const advice = await GeminiService.coachGoal(userId, {
      title: goalDoc.title,
      description: goalDoc.description,
      status: goalDoc.status,
      targetDate: goalDoc.targetDate,
      milestones: goalDoc.milestones,
    });

    return NextResponse.json({ success: true, data: advice });
  } catch (err) {
    console.error("AI Goal Coach Error:", err);
    return NextResponse.json({ success: false, error: "Goal coach service failure" }, { status: 500 });
  }
}
