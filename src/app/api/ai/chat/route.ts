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

    let content = responseText;
    let suggestedAction = null;

    try {
      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed === "object" && "content" in parsed) {
        content = parsed.content;
        if (parsed.suggestedAction) {
          suggestedAction = {
            type: parsed.suggestedAction.type,
            status: "pending",
            data: parsed.suggestedAction.data,
          };
        }
      }
    } catch {
      // Parsing failed, response is plain text
    }

    return NextResponse.json({
      success: true,
      data: {
        role: "model",
        content,
        timestamp: new Date().toISOString(),
        ...(suggestedAction ? { suggestedAction } : {}),
      },
    });
  } catch (err: unknown) {
    console.error("AI Chat Route Error:", err);
    return NextResponse.json({ success: false, error: "AI service failure" }, { status: 500 });
  }
}
