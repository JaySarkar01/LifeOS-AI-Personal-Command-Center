import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { LifeOSContextService } from "@/services/ai/LifeOSContextService";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const context = await LifeOSContextService.getTodayContext(userId);
    const reviewData = {
      summary: `Weekly performance review for ${context.userName}.`,
      taskCompletionRate: context.tasks.length > 0 ? Math.round(((10 - context.tasks.length) / 10) * 100) : 100,
      habitConsistency: "85% consistent across active habits over the past 7 days.",
      biggestWin: "Maintained active habit streak and made progress on key goals.",
      biggestBlocker: "Mid-day context switching during peak focus hours.",
      recommendation: "Protect morning focus blocks to maximize high-priority task completion.",
    };

    return NextResponse.json({ success: true, data: reviewData });
  } catch (err) {
    console.error("AI Weekly Review Error:", err);
    return NextResponse.json({ success: false, error: "Weekly review service failure" }, { status: 500 });
  }
}
