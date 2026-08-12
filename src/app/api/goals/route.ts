import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { GoalModel } from "@/models/mongoose/Goal";
import { Goal } from "@/models/domain/Goal";
import { CreateGoalSchema } from "@/validators";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    await connectDB();

    const goalDocs = await GoalModel.find({ userId }).sort({ createdAt: -1 }).lean();

    const goals = goalDocs.map((doc) => {
      const id = doc._id.toString();
      const goalEntity = new Goal({
        id,
        userId: doc.userId.toString(),
        title: doc.title,
        description: doc.description,
        targetDate: doc.targetDate,
        status: doc.status,
        milestones: doc.milestones || [],
        createdAt: doc.createdAt,
      });

      return {
        id,
        userId: doc.userId,
        title: doc.title,
        description: doc.description,
        targetDate: doc.targetDate,
        status: doc.status,
        milestones: doc.milestones || [],
        progress: goalEntity.calculateProgress(),
        createdAt: doc.createdAt,
      };
    });

    return NextResponse.json({ success: true, data: goals });
  } catch (err) {
    console.error("Error in GET /api/goals:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch goals" } },
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
    const parsed = CreateGoalSchema.safeParse({ ...body, userId });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: parsed.error.issues[0]?.message || "Invalid goal input" } },
        { status: 400 }
      );
    }

    await connectDB();

    const doc = await GoalModel.create({
      userId,
      title: parsed.data.title,
      description: body.description,
      targetDate: parsed.data.targetDate,
      status: parsed.data.status || "in_progress",
      milestones: [],
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: doc._id.toString(),
          userId: doc.userId,
          title: doc.title,
          description: doc.description,
          targetDate: doc.targetDate,
          status: doc.status,
          milestones: [],
          progress: 0,
          createdAt: doc.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in POST /api/goals:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create goal" } },
      { status: 500 }
    );
  }
}
