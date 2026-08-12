import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { TaskModel } from "@/models/mongoose/Task";
import { CreateTaskSchema } from "@/validators";

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
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const search = url.searchParams.get("search");

    const query: Record<string, unknown> = { userId };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const taskDocs = await TaskModel.find(query).sort({ createdAt: -1 }).lean();

    const tasks = taskDocs.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      title: doc.title,
      description: doc.description,
      status: doc.status,
      priority: doc.priority,
      dueDate: doc.dueDate,
      estimatedMinutes: doc.estimatedMinutes,
      tags: doc.tags || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return NextResponse.json({ success: true, data: tasks });
  } catch (err) {
    console.error("Error in GET /api/tasks:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch tasks" } },
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
    const parsed = CreateTaskSchema.safeParse({ ...body, userId });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: parsed.error.issues[0]?.message || "Invalid input" } },
        { status: 400 }
      );
    }

    await connectDB();

    const doc = await TaskModel.create({
      userId,
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status || "todo",
      priority: parsed.data.priority || "medium",
      dueDate: parsed.data.dueDate,
      estimatedMinutes: parsed.data.estimatedMinutes,
      tags: parsed.data.tags || [],
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: doc._id.toString(),
          userId: doc.userId,
          title: doc.title,
          description: doc.description,
          status: doc.status,
          priority: doc.priority,
          dueDate: doc.dueDate,
          estimatedMinutes: doc.estimatedMinutes,
          tags: doc.tags,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in POST /api/tasks:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create task" } },
      { status: 500 }
    );
  }
}
