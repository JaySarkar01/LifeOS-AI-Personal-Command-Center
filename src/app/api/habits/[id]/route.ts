import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { HabitModel } from "@/models/mongoose/Habit";
import { HabitLogModel } from "@/models/mongoose/HabitLog";

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

    const updated = await HabitModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: { message: "Habit not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error in PATCH /api/habits/[id]:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update habit" } },
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

    const deleted = await HabitModel.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { message: "Habit not found" } },
        { status: 404 }
      );
    }

    await HabitLogModel.deleteMany({ habitId: id, userId });

    return NextResponse.json({ success: true, data: { id } });
  } catch (err) {
    console.error("Error in DELETE /api/habits/[id]:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete habit" } },
      { status: 500 }
    );
  }
}
