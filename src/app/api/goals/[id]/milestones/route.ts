import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { GoalModel } from "@/models/mongoose/Goal";
import { Goal } from "@/models/domain/Goal";

export async function POST(
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

    const { id: goalId } = await params;
    const body = await req.json();

    await connectDB();

    const goalDoc = await GoalModel.findOne({ _id: goalId, userId });
    if (!goalDoc) {
      return NextResponse.json(
        { success: false, error: { message: "Goal not found" } },
        { status: 404 }
      );
    }

    const goalEntity = new Goal({
      id: goalDoc._id.toString(),
      userId: goalDoc.userId.toString(),
      title: goalDoc.title,
      description: goalDoc.description,
      targetDate: goalDoc.targetDate,
      status: goalDoc.status,
      milestones: goalDoc.milestones || [],
      createdAt: goalDoc.createdAt,
    });

    if (body.milestoneId) {
      // Toggle milestone completion
      const milestone = goalEntity.milestones.find((m) => m.id === body.milestoneId);
      if (milestone) {
        milestone.completed = !milestone.completed;
      }
    } else if (body.title) {
      // Add milestone
      goalEntity.addMilestone(body.title.trim());
    }

    const updatedDoc = await GoalModel.findOneAndUpdate(
      { _id: goalId, userId },
      { $set: { milestones: goalEntity.milestones, status: goalEntity.status } },
      { returnDocument: "after" }
    );

    if (!updatedDoc) {
      return NextResponse.json(
        { success: false, error: { message: "Goal not found or unauthorized" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc._id.toString(),
        milestones: updatedDoc.milestones,
        progress: goalEntity.calculateProgress(),
        status: updatedDoc.status,
      },
    });
  } catch (err) {
    console.error("Error in POST /api/goals/[id]/milestones:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update milestone" } },
      { status: 500 }
    );
  }
}
