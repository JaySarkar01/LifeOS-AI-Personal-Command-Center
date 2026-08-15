import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { TransactionModel, AccountModel } from "@/models/mongoose/Finance";

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

    const transaction = await TransactionModel.findOne({ _id: id, userId });
    if (!transaction) {
      return NextResponse.json({ success: false, error: { message: "Transaction not found" } }, { status: 404 });
    }

    // Revert account balance
    const amountMod = transaction.type === "expense" ? transaction.amount : -transaction.amount;
    await AccountModel.findByIdAndUpdate(transaction.accountId, {
      $inc: { balance: amountMod }
    });

    await TransactionModel.deleteOne({ _id: id });

    return NextResponse.json({ success: true, data: { id } });
  } catch (err) {
    console.error("Error in DELETE /api/finance/transactions/[id]:", err);
    return NextResponse.json({ success: false, error: { message: "Failed to delete transaction" } }, { status: 500 });
  }
}
