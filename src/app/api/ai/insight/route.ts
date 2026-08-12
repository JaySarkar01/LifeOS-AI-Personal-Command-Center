import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { LifeOSContextService } from "@/services/ai/LifeOSContextService";
import { GeminiService } from "@/services/ai/GeminiService";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const context = await LifeOSContextService.getTodayContext(userId);
    const insight = await GeminiService.generateInsight(userId, context);

    return NextResponse.json({ success: true, data: insight });
  } catch (err) {
    console.error("AI Insight Route Error:", err);
    return NextResponse.json({ success: false, error: "AI service failure" }, { status: 500 });
  }
}
