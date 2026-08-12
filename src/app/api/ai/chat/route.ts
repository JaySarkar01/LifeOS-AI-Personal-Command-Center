import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { LifeOSContextService } from "@/services/ai/LifeOSContextService";
import { GeminiService } from "@/services/ai/GeminiService";
import { z } from "zod";

const ChatRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  history: z.array(z.object({ role: z.string(), content: z.string() })).optional(),
});

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parse = ChatRequestSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
    }

    const { prompt, history } = parse.data;
    const context = await LifeOSContextService.getTodayContext(userId);
    const responseText = await GeminiService.generateChatResponse(userId, prompt, context, history);

    return NextResponse.json({
      success: true,
      data: {
        role: "model",
        content: responseText,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    console.error("AI Chat Route Error:", err);
    return NextResponse.json({ success: false, error: "AI service failure" }, { status: 500 });
  }
}
