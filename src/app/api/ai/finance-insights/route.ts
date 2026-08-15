import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { TransactionModel } from "@/models/mongoose/Finance";
import { GeminiService } from "@/services/ai/GeminiService";

export async function GET(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const url = new URL(req.url);
    const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7); // Default to current YYYY-MM

    await connectDB();
    
    // Get this month's transactions
    const transactions = await TransactionModel.find({ 
      userId,
      date: { $regex: `^${month}` }
    }).lean();

    let income = 0;
    let expenses = 0;
    const categoryTotals: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type === "income") {
        income += t.amount;
      } else if (t.type === "expense") {
        expenses += t.amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    const topCategories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    const context = { income, expenses, topCategories };
    const insight = await GeminiService.generateFinancialInsight(userId, context);

    return NextResponse.json({ success: true, data: insight });
  } catch (err) {
    console.error("Error in AI Finance Insight Route:", err);
    return NextResponse.json({ success: false, error: { message: "AI service failure" } }, { status: 500 });
  }
}
