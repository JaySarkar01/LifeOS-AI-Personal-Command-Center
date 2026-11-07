import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { AccountModel, TransactionModel } from "@/models/mongoose/Finance";
import { TransferFundsSchema } from "@/validators";

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json();
    const parsed = TransferFundsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { message: parsed.error.issues[0]?.message || "Invalid transfer data" } },
        { status: 400 }
      );
    }

    const { fromAccountId, toAccountId, amount, description, date } = parsed.data;

    if (fromAccountId === toAccountId) {
      return NextResponse.json(
        { success: false, error: { message: "Source and destination bank accounts cannot be the same" } },
        { status: 400 }
      );
    }

    await connectDB();

    const [fromAccount, toAccount] = await Promise.all([
      AccountModel.findOne({ _id: fromAccountId, userId }),
      AccountModel.findOne({ _id: toAccountId, userId }),
    ]);

    if (!fromAccount) {
      return NextResponse.json({ success: false, error: { message: "Source bank account not found" } }, { status: 404 });
    }
    if (!toAccount) {
      return NextResponse.json({ success: false, error: { message: "Destination bank account not found" } }, { status: 404 });
    }

    // Update balances
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await Promise.all([fromAccount.save(), toAccount.save()]);

    const fromLabel = fromAccount.bankName ? `${fromAccount.bankName} (${fromAccount.name})` : fromAccount.name;
    const toLabel = toAccount.bankName ? `${toAccount.bankName} (${toAccount.name})` : toAccount.name;

    // Create dual transaction records
    const outgoingTx = await TransactionModel.create({
      userId,
      accountId: fromAccount._id,
      type: "expense",
      amount,
      category: "Transfer",
      description: description ? `${description} (Transfer to ${toLabel})` : `Transfer to ${toLabel}`,
      date,
      isRecurring: false,
    });

    const incomingTx = await TransactionModel.create({
      userId,
      accountId: toAccount._id,
      type: "income",
      amount,
      category: "Transfer",
      description: description ? `${description} (Transfer from ${fromLabel})` : `Transfer from ${fromLabel}`,
      date,
      isRecurring: false,
    });

    return NextResponse.json({
      success: true,
      data: {
        fromAccount: {
          id: fromAccount._id.toString(),
          name: fromAccount.name,
          balance: fromAccount.balance,
        },
        toAccount: {
          id: toAccount._id.toString(),
          name: toAccount.name,
          balance: toAccount.balance,
        },
        transactions: [outgoingTx._id.toString(), incomingTx._id.toString()],
      },
    }, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/finance/transfer:", err);
    return NextResponse.json({ success: false, error: { message: "Failed to process transfer" } }, { status: 500 });
  }
}

