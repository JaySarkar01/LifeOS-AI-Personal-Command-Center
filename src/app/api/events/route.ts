import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { EventModel } from "@/models/mongoose/Event";
import { CreateEventSchema } from "@/validators";

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

    const eventDocs = await EventModel.find({ userId }).sort({ startTime: 1 }).lean();

    const events = eventDocs.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      title: doc.title,
      description: doc.description,
      startTime: doc.startTime,
      endTime: doc.endTime,
      type: doc.type,
      location: doc.location,
      isAllDay: doc.isAllDay,
      createdAt: doc.createdAt,
    }));

    return NextResponse.json({ success: true, data: events });
  } catch (err) {
    console.error("Error in GET /api/events:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch schedule events" } },
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
    const parsed = CreateEventSchema.safeParse({ ...body, userId });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: parsed.error.issues[0]?.message || "Invalid event input" } },
        { status: 400 }
      );
    }

    await connectDB();

    const doc = await EventModel.create({
      userId,
      title: parsed.data.title,
      description: body.description,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      type: parsed.data.type || "focus_session",
      location: body.location,
      isAllDay: parsed.data.isAllDay || false,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: doc._id.toString(),
          userId: doc.userId,
          title: doc.title,
          description: doc.description,
          startTime: doc.startTime,
          endTime: doc.endTime,
          type: doc.type,
          location: doc.location,
          isAllDay: doc.isAllDay,
          createdAt: doc.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in POST /api/events:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create event" } },
      { status: 500 }
    );
  }
}
