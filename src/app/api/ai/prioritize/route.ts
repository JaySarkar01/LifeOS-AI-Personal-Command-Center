import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import connectToDatabase from "@/lib/db/mongoose";
import { TaskModel } from "@/models/mongoose/Task";
import { Task } from "@/models/domain/Task";
import { PriorityQueue } from "@/lib/structures/PriorityQueue";

export async function POST() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const taskDocs = await TaskModel.find({ userId, status: { $ne: "completed" } }).lean();

    const pq = new PriorityQueue<Task>();
    for (const doc of taskDocs) {
      const t = new Task({
        id: doc._id.toString(),
        userId: doc.userId.toString(),
        title: doc.title,
        priority: doc.priority,
        status: doc.status,
        dueDate: doc.dueDate,
        createdAt: doc.createdAt,
      });
      pq.enqueue(t, t.calculatePriorityScore());
    }

    const sortedTasks: Task[] = [];
    while (!pq.isEmpty()) {
      const item = pq.dequeue();
      if (item) sortedTasks.push(item);
    }

    return NextResponse.json({
      success: true,
      data: {
        prioritizedTasks: sortedTasks.map((t) => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          score: t.calculatePriorityScore(),
        })),
        rationale: "Tasks ordered via LifeOS PriorityQueue scoring combining urgency, priority weight, and due date proximity.",
      },
    });
  } catch (err) {
    console.error("AI Prioritize Route Error:", err);
    return NextResponse.json({ success: false, error: "Prioritization service failure" }, { status: 500 });
  }
}
