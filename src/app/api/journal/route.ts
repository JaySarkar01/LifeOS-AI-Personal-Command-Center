import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { JournalEntryModel } from "@/models/mongoose/JournalEntry";
import { CreateJournalEntrySchema } from "@/validators";

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
    const month = url.searchParams.get("month"); // YYYY-MM format

    const query: Record<string, unknown> = { userId };

    if (month) {
      // Filter entries for a specific month (e.g., "2026-08")
      const startDate = `${month}-01`;
      const [year, mon] = month.split("-").map(Number);
      const endDate = `${year}-${String(mon + 1).padStart(2, "0")}-01`;
      query.date = { $gte: startDate, $lt: endDate };
    }

    const entries = await JournalEntryModel.find(query)
      .sort({ date: -1 })
      .lean();

    const data = entries.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      date: doc.date,
      mood: doc.mood,
      content: doc.content || "",
      highlights: doc.highlights || [],
      tags: doc.tags || [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error in GET /api/journal:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch journal entries" } },
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
    const parsed = CreateJournalEntrySchema.safeParse({ ...body, userId });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: parsed.error.issues[0]?.message || "Invalid journal entry input" } },
        { status: 400 }
      );
    }

    await connectDB();

    // Upsert: create or update entry for the given date
    const doc = await JournalEntryModel.findOneAndUpdate(
      { userId, date: parsed.data.date },
      {
        $set: {
          mood: parsed.data.mood || "neutral",
          content: parsed.data.content || "",
          highlights: parsed.data.highlights || [],
          tags: parsed.data.tags || [],
        },
        $setOnInsert: {
          userId,
          date: parsed.data.date,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          id: doc._id.toString(),
          userId: doc.userId,
          date: doc.date,
          mood: doc.mood,
          content: doc.content,
          highlights: doc.highlights,
          tags: doc.tags,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in POST /api/journal:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create journal entry" } },
      { status: 500 }
    );
  }
}
