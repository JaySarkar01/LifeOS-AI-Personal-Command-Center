import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { TransactionModel, AccountModel } from "@/models/mongoose/Finance";
import { CreateTransactionSchema } from "@/validators";

export async function GET(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    await connectDB();
    
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const month = url.searchParams.get("month"); // YYYY-MM

    const query: Record<string, unknown> = { userId };
    if (month) {
      query.date = { $regex: `^${month}` }; // Match dates starting with YYYY-MM
    }

    const transactions = await TransactionModel.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    
    const data = transactions.map(doc => ({
      id: doc._id.toString(),
      accountId: doc.accountId.toString(),
      type: doc.type,
      amount: doc.amount,
      category: doc.category,
      description: doc.description,
      date: doc.date,
      isRecurring: doc.isRecurring,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error in GET /api/finance/transactions:", err);
    return NextResponse.json({ success: false, error: { message: "Failed to fetch transactions" } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreateTransactionSchema.safeParse({ ...body, userId });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: parsed.error.issues[0]?.message || "Invalid input" } },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Create transaction
    const doc = await TransactionModel.create(parsed.data);

    // Update account balance
    const amountMod = parsed.data.type === "expense" ? -parsed.data.amount : parsed.data.amount;
    // For transfer, would need logic for to/from, but keeping it simple for now (adding to account)
    // A full transfer implementation would have source/dest accounts
    await AccountModel.findByIdAndUpdate(parsed.data.accountId, {
      $inc: { balance: amountMod }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: doc._id.toString(),
        accountId: doc.accountId.toString(),
        type: doc.type,
        amount: doc.amount,
        category: doc.category,
        description: doc.description,
        date: doc.date,
      }
    }, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/finance/transactions:", err);
    return NextResponse.json({ success: false, error: { message: "Failed to create transaction" } }, { status: 500 });
  }
}
