import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { NoteModel } from "@/models/mongoose/Note";

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

    await connectDB();

    const updated = await NoteModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: { message: "Note not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated._id.toString(),
        userId: updated.userId,
        title: updated.title,
        content: updated.content,
        type: updated.type,
        tags: updated.tags,
        archived: updated.archived,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error("Error in PATCH /api/notes/[id]:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update note" } },
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

    const deleted = await NoteModel.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { message: "Note not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (err) {
    console.error("Error in DELETE /api/notes/[id]:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete note" } },
      { status: 500 }
    );
  }
}
