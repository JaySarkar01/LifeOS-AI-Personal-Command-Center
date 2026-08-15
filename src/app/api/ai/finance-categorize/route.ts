import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { GeminiService } from "@/services/ai/GeminiService";

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { description, amount } = await req.json();
    if (!description) {
      return NextResponse.json({ success: false, error: { message: "Description required" } }, { status: 400 });
    }

    const insight = await GeminiService.autoCategorizeTransaction(description, amount || 0);

    return NextResponse.json({ success: true, data: insight });
  } catch (err) {
    console.error("Error in AI Categorize Route:", err);
    return NextResponse.json({ success: false, error: { message: "AI service failure" } }, { status: 500 });
  }
}
