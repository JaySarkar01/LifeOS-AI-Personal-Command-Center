import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { NoteModel } from "@/models/mongoose/Note";
import { CreateNoteSchema } from "@/validators";

export async function GET(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    await connectDB();

    const url = new URL(req.url);
    const search = url.searchParams.get("search");
    const tag = url.searchParams.get("tag");

    const query: Record<string, unknown> = { userId };
    if (tag) {
      query.tags = tag;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const noteDocs = await NoteModel.find(query).sort({ updatedAt: -1 }).lean();

    const notes = noteDocs.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      title: doc.title,
      content: doc.content || "",
      type: doc.type,
      tags: doc.tags || [],
      archived: doc.archived,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return NextResponse.json({ success: true, data: notes });
  } catch (err) {
    console.error("Error in GET /api/notes:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch notes" } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = CreateNoteSchema.safeParse({ ...body, userId });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: parsed.error.issues[0]?.message || "Invalid note input" } },
        { status: 400 }
      );
    }

    await connectDB();

    const doc = await NoteModel.create({
      userId,
      title: parsed.data.title,
      content: parsed.data.content || "",
      type: parsed.data.type || "quick",
      tags: parsed.data.tags || [],
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: doc._id.toString(),
          userId: doc.userId,
          title: doc.title,
          content: doc.content,
          type: doc.type,
          tags: doc.tags,
          archived: doc.archived,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in POST /api/notes:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create note" } },
      { status: 500 }
    );
  }
}
