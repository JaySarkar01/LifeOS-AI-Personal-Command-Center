import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { LifeOSContextService } from "@/services/ai/LifeOSContextService";
import { GeminiService } from "@/services/ai/GeminiService";
import { z } from "zod";

const SummarizeNoteSchema = z.object({
  noteId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parse = SummarizeNoteSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ success: false, error: "noteId required" }, { status: 400 });
    }

    const note = await LifeOSContextService.getNoteContext(userId, parse.data.noteId);
    if (!note) {
      return NextResponse.json({ success: false, error: "Note not found or access denied" }, { status: 404 });
    }

    const summary = await GeminiService.summarizeNote(userId, note.title, note.content);
    return NextResponse.json({ success: true, data: { noteId: note.id, title: note.title, summary } });
  } catch (err) {
    console.error("AI Summarize Note Error:", err);
    return NextResponse.json({ success: false, error: "Note summary service failure" }, { status: 500 });
  }
}
