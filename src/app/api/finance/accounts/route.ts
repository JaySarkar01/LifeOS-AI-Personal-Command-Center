import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { AccountModel } from "@/models/mongoose/Finance";
import { CreateAccountSchema } from "@/validators";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    await connectDB();
    const accounts = await AccountModel.find({ userId }).sort({ createdAt: -1 }).lean();
    
    const data = accounts.map(doc => ({
      id: doc._id.toString(),
      name: doc.name,
      type: doc.type,
      balance: doc.balance,
      currency: doc.currency,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error in GET /api/finance/accounts:", err);
    return NextResponse.json({ success: false, error: { message: "Failed to fetch accounts" } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreateAccountSchema.safeParse({ ...body, userId });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: parsed.error.issues[0]?.message || "Invalid input" } },
        { status: 400 }
      );
    }

    await connectDB();
    const doc = await AccountModel.create(parsed.data);

    return NextResponse.json({
      success: true,
      data: {
        id: doc._id.toString(),
        name: doc.name,
        type: doc.type,
        balance: doc.balance,
        currency: doc.currency,
      }
    }, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/finance/accounts:", err);
    return NextResponse.json({ success: false, error: { message: "Failed to create account" } }, { status: 500 });
  }
}
