import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { JournalEntryModel } from "@/models/mongoose/JournalEntry";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    // Only allow updating specific fields
    const allowedFields: Record<string, unknown> = {};
    if (body.mood !== undefined) allowedFields.mood = body.mood;
    if (body.content !== undefined) allowedFields.content = body.content;
    if (body.highlights !== undefined) allowedFields.highlights = body.highlights;
    if (body.tags !== undefined) allowedFields.tags = body.tags;

    await connectDB();

    const updated = await JournalEntryModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: allowedFields },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: { message: "Journal entry not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated._id.toString(),
        userId: updated.userId,
        date: updated.date,
        mood: updated.mood,
        content: updated.content,
        highlights: updated.highlights,
        tags: updated.tags,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error("Error in PATCH /api/journal/[id]:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update journal entry" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    const deleted = await JournalEntryModel.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { message: "Journal entry not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (err) {
    console.error("Error in DELETE /api/journal/[id]:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete journal entry" } },
      { status: 500 }
    );
  }
}
