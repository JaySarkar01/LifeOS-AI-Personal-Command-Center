import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { BudgetModel } from "@/models/mongoose/Finance";
import { CreateBudgetSchema } from "@/validators";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    await connectDB();
    const budgets = await BudgetModel.find({ userId }).sort({ category: 1 }).lean();
    
    const data = budgets.map(doc => ({
      id: doc._id.toString(),
      category: doc.category,
      limit: doc.limit,
      period: doc.period,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error in GET /api/finance/budgets:", err);
    return NextResponse.json({ success: false, error: { message: "Failed to fetch budgets" } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreateBudgetSchema.safeParse({ ...body, userId });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: parsed.error.issues[0]?.message || "Invalid input" } },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Upsert budget for category
    const doc = await BudgetModel.findOneAndUpdate(
      { userId, category: parsed.data.category, period: parsed.data.period || "monthly" },
      { $set: { limit: parsed.data.limit } },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        id: doc._id.toString(),
        category: doc.category,
        limit: doc.limit,
        period: doc.period,
      }
    }, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/finance/budgets:", err);
    return NextResponse.json({ success: false, error: { message: "Failed to create budget" } }, { status: 500 });
  }
}
