import { AccountType, TransactionType, BudgetPeriod } from "@/types";

export interface AccountProps {
  id: string;
  userId: string;
  name: string;
  type?: AccountType;
  balance?: number;
  currency?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Account {
  public readonly id: string;
  public readonly userId: string;
  public name: string;
  public type: AccountType;
  public balance: number;
  public currency: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: AccountProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.name = props.name;
    this.type = props.type || "checking";
    this.balance = props.balance || 0;
    this.currency = props.currency || "USD";
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}

export interface TransactionProps {
  id: string;
  userId: string;
  accountId: string;
  type?: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date: string;
  isRecurring?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Transaction {
  public readonly id: string;
  public readonly userId: string;
  public accountId: string;
  public type: TransactionType;
  public amount: number;
  public category: string;
  public description: string;
  public date: string;
  public isRecurring: boolean;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: TransactionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.accountId = props.accountId;
    this.type = props.type || "expense";
    this.amount = props.amount;
    this.category = props.category;
    this.description = props.description || "";
    this.date = props.date;
    this.isRecurring = props.isRecurring || false;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}

export interface BudgetProps {
  id: string;
  userId: string;
  category: string;
  limit: number;
  period?: BudgetPeriod;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Budget {
  public readonly id: string;
  public readonly userId: string;
  public category: string;
  public limit: number;
  public period: BudgetPeriod;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(props: BudgetProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.category = props.category;
    this.limit = props.limit;
    this.period = props.period || "monthly";
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
