import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { AIActionService, AIActionRateLimiter } from "@/services/ai/AIActionService";
import { ExecuteActionRequestSchema } from "@/validators/ai-actions";

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: { message: "Missing request body" } },
        { status: 400 }
      );
    }

    const parsed = ExecuteActionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: parsed.error.issues[0]?.message || "Invalid AI action payload format",
          },
        },
        { status: 400 }
      );
    }

    // Rate Limit Check
    if (!AIActionRateLimiter.checkLimit(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "AI action execution limit reached. Please wait a moment before executing more actions.",
          },
        },
        { status: 429 }
      );
    }

    // Check if single action or batch actions
    if ("action" in parsed.data) {
      const result = await AIActionService.executeAction(userId, parsed.data.action);
      
      if (!result.success && result.statusCode && result.statusCode !== 200) {
        return NextResponse.json(
          { success: false, error: { message: result.message } },
          { status: result.statusCode }
        );
      }

      return NextResponse.json({
        success: true,
        data: result,
      });
    } else {
      const results = await AIActionService.executeActions(userId, parsed.data.actions);
      const allSuccessful = results.every((r) => r.success);

      return NextResponse.json({
        success: allSuccessful,
        data: {
          results,
          total: results.length,
          successful: results.filter((r) => r.success).length,
        },
      });
    }
  } catch (err: unknown) {
    // Log safe internal message without exposing stack or paths to client
    console.error("AI Action Execute Route Error:", err instanceof Error ? err.message : "Internal Error");
    return NextResponse.json(
      { success: false, error: { message: "Action execution failure" } },
      { status: 500 }
    );
  }
}
