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
    const summary = await GeminiService.generateDailySummary(userId, context);

    return NextResponse.json({ success: true, data: summary });
  } catch (err) {
    console.error("AI Daily Summary Error:", err);
    return NextResponse.json({ success: false, error: "AI service failure" }, { status: 500 });
  }
}
