import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { LifeOSContextService } from "@/services/ai/LifeOSContextService";
import { GeminiService } from "@/services/ai/GeminiService";
import { z } from "zod";

const PlanDaySchema = z.object({
  availableHours: z.number().min(1).max(16).default(8),
  focusPreference: z.string().default("morning"),
});

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parse = PlanDaySchema.safeParse(body);
    const { availableHours, focusPreference } = parse.success ? parse.data : { availableHours: 8, focusPreference: "morning" };

    const context = await LifeOSContextService.getTodayContext(userId);
    const plan = await GeminiService.generateDayPlan(userId, context, availableHours, focusPreference);

    return NextResponse.json({ success: true, data: plan });
  } catch (err) {
    console.error("AI Plan Day Error:", err);
    return NextResponse.json({ success: false, error: "AI planning service failure" }, { status: 500 });
  }
}
