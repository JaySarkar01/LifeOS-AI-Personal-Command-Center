import mongoose, { Schema, Document, Model } from "mongoose";
import { AccountType, TransactionType, BudgetPeriod } from "@/types";

// --- Account ---
export interface IAccountDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccountDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["checking", "savings", "credit", "cash"], default: "checking" },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
  },
  { timestamps: true }
);

export const AccountModel: Model<IAccountDocument> =
  mongoose.models.Account || mongoose.model<IAccountDocument>("Account", AccountSchema);

// --- Transaction ---
export interface ITransactionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransactionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    type: { type: String, enum: ["income", "expense", "transfer"], default: "expense" },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    date: { type: String, required: true, index: true }, // Index for fast date filtering
    isRecurring: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const TransactionModel: Model<ITransactionDocument> =
  mongoose.models.Transaction || mongoose.model<ITransactionDocument>("Transaction", TransactionSchema);

// --- Budget ---
export interface IBudgetDocument extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  limit: number;
  period: BudgetPeriod;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudgetDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true },
    period: { type: String, enum: ["weekly", "monthly", "yearly"], default: "monthly" },
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, category: 1, period: 1 }, { unique: true });

export const BudgetModel: Model<IBudgetDocument> =
  mongoose.models.Budget || mongoose.model<IBudgetDocument>("Budget", BudgetSchema);
