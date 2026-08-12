import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { EventModel } from "@/models/mongoose/Event";

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

    const updated = await EventModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error in PATCH /api/events/[id]:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update event" } },
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

    const deleted = await EventModel.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { message: "Event not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (err) {
    console.error("Error in DELETE /api/events/[id]:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete event" } },
      { status: 500 }
    );
  }
}
