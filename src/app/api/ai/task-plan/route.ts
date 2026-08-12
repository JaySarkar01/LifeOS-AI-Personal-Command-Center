import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { GeminiService } from "@/services/ai/GeminiService";
import { z } from "zod";

const TaskPlanSchema = z.object({
  userGoalText: z.string().min(3).max(500),
});

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parse = TaskPlanSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: "Invalid goal objective text" }, { status: 400 });
    }

    const plan = await GeminiService.generateTaskPlan(userId, parse.data.userGoalText);
    return NextResponse.json({ success: true, data: plan });
  } catch (err) {
    console.error("AI Task Plan Error:", err);
    return NextResponse.json({ success: false, error: "AI task plan service failure" }, { status: 500 });
  }
}
