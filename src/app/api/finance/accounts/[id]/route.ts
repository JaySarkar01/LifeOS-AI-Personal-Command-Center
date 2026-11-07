import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { AccountModel, TransactionModel } from "@/models/mongoose/Finance";
import { UpdateAccountSchema } from "@/validators";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const doc = await AccountModel.findOne({ _id: id, userId }).lean();
    if (!doc) {
      return NextResponse.json({ success: false, error: { message: "Account not found" } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: doc._id.toString(),
        name: doc.name,
        bankName: doc.bankName || "",
        accountNumber: doc.accountNumber || "",
        type: doc.type,
        balance: doc.balance,
        currency: doc.currency,
        color: doc.color || "blue",
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (err) {
    console.error("Error in GET /api/finance/accounts/[id]:", err);
    return NextResponse.json({ success: false, error: { message: "Failed to fetch account" } }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const parsed = UpdateAccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: parsed.error.issues[0]?.message || "Invalid input" } },
        { status: 400 }
      );
    }

    await connectDB();

    const updated = await AccountModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: parsed.data },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, error: { message: "Account not found" } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated._id.toString(),
        name: updated.name,
        bankName: updated.bankName || "",
        accountNumber: updated.accountNumber || "",
        type: updated.type,
        balance: updated.balance,
        currency: updated.currency,
        color: updated.color || "blue",
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    console.error("Error in PATCH /api/finance/accounts/[id]:", err);
    return NextResponse.json({ success: false, error: { message: "Failed to update account" } }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const account = await AccountModel.findOne({ _id: id, userId });
    if (!account) {
      return NextResponse.json({ success: false, error: { message: "Account not found" } }, { status: 404 });
    }

    // Preserve all transactions - do not delete transactions when account is removed
    await AccountModel.deleteOne({ _id: id, userId });

    return NextResponse.json({ success: true, data: { id } });
  } catch (err) {
    console.error("Error in DELETE /api/finance/accounts/[id]:", err);
    return NextResponse.json({ success: false, error: { message: "Failed to delete account" } }, { status: 500 });
  }
}

