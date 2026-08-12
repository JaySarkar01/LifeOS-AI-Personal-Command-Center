import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { TaskModel } from "@/models/mongoose/Task";
import { UpdateTaskSchema } from "@/validators";

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
    const parsed = UpdateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: parsed.error.issues[0]?.message || "Invalid payload" } },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedDoc = await TaskModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: parsed.data },
      { new: true }
    );

    if (!updatedDoc) {
      return NextResponse.json(
        { success: false, error: { message: "Task not found or unauthorized" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc._id.toString(),
        userId: updatedDoc.userId,
        title: updatedDoc.title,
        description: updatedDoc.description,
        status: updatedDoc.status,
        priority: updatedDoc.priority,
        dueDate: updatedDoc.dueDate,
        estimatedMinutes: updatedDoc.estimatedMinutes,
        tags: updatedDoc.tags,
        createdAt: updatedDoc.createdAt,
        updatedAt: updatedDoc.updatedAt,
      },
    });
  } catch (err) {
    console.error("Error in PATCH /api/tasks/[id]:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update task" } },
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

    const deleted = await TaskModel.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { message: "Task not found or unauthorized" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { id } });
  } catch (err) {
    console.error("Error in DELETE /api/tasks/[id]:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete task" } },
      { status: 500 }
    );
  }
}
