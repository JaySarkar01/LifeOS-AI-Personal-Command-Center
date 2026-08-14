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
    const todayStr = context.date || new Date().toISOString().split("T")[0];
    const actions = plan.blocks.map((b) => ({
      type: "CREATE_EVENT" as const,
      entityType: "event" as const,
      payload: {
        title: b.title,
        startTime: `${todayStr}T${b.start}:00`,
        endTime: `${todayStr}T${b.end}:00`,
        type: b.type === "deep_work" ? "focus_session" : "personal",
      },
      reason: b.reason,
      requiresConfirmation: true,
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...plan,
        actions,
      },
    });
  } catch (err) {
    console.error("AI Plan Day Error:", err);
    return NextResponse.json({ success: false, error: "AI planning service failure" }, { status: 500 });
  }
}
