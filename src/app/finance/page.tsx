"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Plus,
  Trash2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  RefreshCw,
  Landmark,
  Building2,
  ArrowRightLeft,
  Pencil,
  PiggyBank,
  Coins,
  Filter,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassBadge } from "@/components/ui/GlassBadge";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/providers/ToastProvider";
import { pageTransition } from "@/lib/motion";

/* --- Types --- */
interface Account {
  id: string;
  name: string;
  bankName?: string;
  accountNumber?: string;
  type: "checking" | "savings" | "credit" | "cash" | "investment" | string;
  balance: number;
  currency: string;
  color?: string;
}

interface Transaction {
  id: string;
  accountId: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface Budget {
  id: string;
  category: string;
  limit: number;
  period: string;
}

interface AIInsight {
  headline: string;
  insight: string;
  tip: string;
}

// Major Indian Banks & Presets
const INDIAN_BANKS = [
  "HDFC Bank",
  "SBI",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra",
  "PNB",
  "Bank of Baroda",
  "Paytm / UPI",
  "Cash",
];

const ACCOUNT_TYPES = [
  { value: "savings", label: "Savings Account", icon: PiggyBank },
  { value: "checking", label: "Current Account", icon: Landmark },
  { value: "credit", label: "Credit Card", icon: CreditCard },
  { value: "investment", label: "FD / Investment", icon: TrendingUp },
  { value: "cash", label: "Cash / UPI Wallet", icon: Coins },
];

const COLOR_OPTIONS = [
  { name: "Blue", value: "blue", border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400" },
  { name: "Emerald", value: "emerald", border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  { name: "Purple", value: "purple", border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-400" },
  { name: "Amber", value: "amber", border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-400" },
  { name: "Rose", value: "rose", border: "border-rose-500/30", bg: "bg-rose-500/10", text: "text-rose-400" },
  { name: "Cyan", value: "cyan", border: "border-cyan-500/30", bg: "bg-cyan-500/10", text: "text-cyan-400" },
];

// Indian Rupee (INR) Number Formatter
const formatINR = (amount: number): string => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${amount.toFixed(2)}`;
  }
};

export default function FinancePage() {
  const { showToast } = useToast();

  // Data State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [insight, setInsight] = useState<AIInsight | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>("all");

  // Modals
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);

  // Add / Edit Account Form State (Exclusively INR)
  const [accName, setAccName] = useState("");
  const [accBankName, setAccBankName] = useState("");
  const [accType, setAccType] = useState<string>("savings");
  const [accBalance, setAccBalance] = useState("0");
  const [accNumber, setAccNumber] = useState("");
  const [accColor, setAccColor] = useState("blue");
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Transfer Form State
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDesc, setTransferDesc] = useState("");
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split("T")[0]);
  const [isTransferring, setIsTransferring] = useState(false);

  // Add Transaction Form State
  const [txType, setTxType] = useState<"expense" | "income">("expense");
  const [txAmount, setTxAmount] = useState("");
  const [txDesc, setTxDesc] = useState("");
  const [txCategory, setTxCategory] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txAccount, setTxAccount] = useState("");
  const [isAutoCategorizing, setIsAutoCategorizing] = useState(false);

  // Fetch Data
  const fetchFinanceData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [accRes, txRes, budRes] = await Promise.all([
        fetch("/api/finance/accounts"),
        fetch("/api/finance/transactions?limit=50"),
        fetch("/api/finance/budgets"),
      ]);

      const accData = await accRes.json();
      const txData = await txRes.json();
      const budData = await budRes.json();

      if (accData.success) {
        setAccounts(accData.data);
        if (accData.data.length > 0 && !txAccount) {
          setTxAccount(accData.data[0].id);
        }
      }
      if (txData.success) setTransactions(txData.data);
      if (budData.success) setBudgets(budData.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load finance data", undefined, "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast, txAccount]);

  const fetchInsights = useCallback(async () => {
    setIsInsightLoading(true);
    try {
      const res = await fetch("/api/ai/finance-insights");
      const data = await res.json();
      if (data.success) {
        setInsight(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsInsightLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinanceData().then(() => fetchInsights());
  }, [fetchFinanceData, fetchInsights]);

  // Account Modal Helpers
  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setAccName("");
    setAccBankName("");
    setAccType("savings");
    setAccBalance("0");
    setAccNumber("");
    setAccColor("blue");
    setShowAccountModal(true);
  };

  const handleOpenEditAccount = (acc: Account) => {
    setEditingAccount(acc);
    setAccName(acc.name);
    setAccBankName(acc.bankName || "");
    setAccType(acc.type || "savings");
    setAccBalance(acc.balance.toString());
    setAccNumber(acc.accountNumber || "");
    setAccColor(acc.color || "blue");
    setShowAccountModal(true);
  };

  const handleSaveAccount = async () => {
    if (!accName.trim()) {
      showToast("Please provide an account name", undefined, "error");
      return;
    }

    setIsSavingAccount(true);
    try {
      const payload = {
        name: accName.trim(),
        bankName: accBankName.trim(),
        type: accType,
        balance: parseFloat(accBalance) || 0,
        currency: "INR",
        accountNumber: accNumber.trim(),
        color: accColor,
      };

      let res;
      if (editingAccount) {
        res = await fetch(`/api/finance/accounts/${editingAccount.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/finance/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        showToast(
          editingAccount ? "Bank account updated successfully" : "Bank account added successfully",
          undefined,
          "success"
        );
        setShowAccountModal(false);
        fetchFinanceData();
      } else {
        showToast(data.error?.message || "Failed to save bank account", undefined, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred while saving the account", undefined, "error");
    } finally {
      setIsSavingAccount(false);
    }
  };

  const confirmDeleteAccount = async () => {
    if (!deleteAccountId) return;
    try {
      const res = await fetch(`/api/finance/accounts/${deleteAccountId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Bank account removed. Transactions were preserved.", undefined, "info");
        if (selectedAccountFilter === deleteAccountId) {
          setSelectedAccountFilter("all");
        }
        fetchFinanceData();
      } else {
        showToast(data.error?.message || "Failed to delete bank account", undefined, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to delete account", undefined, "error");
    } finally {
      setDeleteAccountId(null);
    }
  };

  // Transfer Modal Helpers
  const handleOpenTransferModal = (defaultFromId?: string) => {
    if (accounts.length < 2) {
      showToast("You need at least 2 bank accounts to transfer funds", undefined, "info");
      return;
    }
    const fromId = defaultFromId || accounts[0]?.id;
    const toId = accounts.find((a) => a.id !== fromId)?.id || accounts[1]?.id;
    setTransferFrom(fromId);
    setTransferTo(toId);
    setTransferAmount("");
    setTransferDesc("");
    setTransferDate(new Date().toISOString().split("T")[0]);
    setShowTransferModal(true);
  };

  const handleTransfer = async () => {
    const amountNum = parseFloat(transferAmount);
    if (!transferFrom || !transferTo || !amountNum || amountNum <= 0) {
      showToast("Please enter a valid transfer amount and accounts", undefined, "error");
      return;
    }
    if (transferFrom === transferTo) {
      showToast("Source and destination accounts must be different", undefined, "error");
      return;
    }

    setIsTransferring(true);
    try {
      const res = await fetch("/api/finance/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccountId: transferFrom,
          toAccountId: transferTo,
          amount: amountNum,
          description: transferDesc.trim() || undefined,
          date: transferDate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Transfer completed successfully", undefined, "success");
        setShowTransferModal(false);
        fetchFinanceData();
      } else {
        showToast(data.error?.message || "Transfer failed", undefined, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to complete transfer", undefined, "error");
    } finally {
      setIsTransferring(false);
    }
  };

  // AI Auto Categorize
  const handleAutoCategorize = async () => {
    if (!txDesc) return;
    setIsAutoCategorizing(true);
    try {
      const res = await fetch("/api/ai/finance-categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: txDesc, amount: parseFloat(txAmount) || 0 }),
      });
      const data = await res.json();
      if (data.success && data.data.category) {
        setTxCategory(data.data.category);
        showToast("Category suggested by AI", undefined, "success");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAutoCategorizing(false);
    }
  };

  // Add Transaction
  const handleAddTransaction = async () => {
    if (!txAmount || !txCategory || !txAccount) {
      showToast("Please fill in the amount, category, and select a bank account", undefined, "error");
      return;
    }

    try {
      const res = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: txAccount,
          type: txType,
          amount: parseFloat(txAmount),
          category: txCategory,
          description: txDesc,
          date: txDate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Transaction added successfully", undefined, "success");
        setShowAddTxModal(false);
        setTxDesc("");
        setTxAmount("");
        setTxCategory("");
        fetchFinanceData();
      } else {
        showToast(data.error?.message || "Failed to add transaction", undefined, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to add transaction", undefined, "error");
    }
  };

  const confirmDeleteTx = async () => {
    if (!deleteTxId) return;
    try {
      await fetch(`/api/finance/transactions/${deleteTxId}`, { method: "DELETE" });
      showToast("Transaction deleted", undefined, "info");
      fetchFinanceData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTxId(null);
    }
  };

  // Calculations
  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, a) => acc + (a.type === "credit" ? -Math.abs(a.balance) : a.balance), 0);
  }, [accounts]);

  const thisMonthIncome = useMemo(() => {
    return transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const thisMonthExpense = useMemo(() => {
    return transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    if (selectedAccountFilter === "all") return transactions;
    return transactions.filter((t) => t.accountId === selectedAccountFilter);
  }, [transactions, selectedAccountFilter]);

  const getBudgetProgress = (category: string) => {
    const budget = budgets.find((b) => b.category === category);
    if (!budget) return null;
    const spent = transactions
      .filter((t) => t.type === "expense" && t.category === category)
      .reduce((acc, t) => acc + t.amount, 0);
    return { spent, limit: budget.limit, percent: Math.min(100, (spent / budget.limit) * 100) };
  };

  const getAccountById = (id: string) => accounts.find((a) => a.id === id);

  return (
    <AppShell>
      <PageContainer>
        <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-6">
          {/* Header */}
          <PageHeader
            badge="India Wealth Center"
            badgeIcon={Building2}
            title="Finance Center"
            description="Manage your bank accounts across India (HDFC, SBI, ICICI, etc.), transfer funds, and track expenses in ₹ (INR)."
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenTransferModal()}
                  className="gap-1.5"
                  disabled={accounts.length < 2}
                  title={accounts.length < 2 ? "Add at least 2 bank accounts to enable transfers" : "Transfer between banks"}
                >
                  <ArrowRightLeft className="w-4 h-4 text-accent" /> Transfer Funds
                </GlassButton>
                <GlassButton variant="secondary" size="sm" onClick={handleOpenAddAccount} className="gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" /> Add Bank
                </GlassButton>
                <GlassButton variant="primary" size="sm" onClick={() => setShowAddTxModal(true)} className="gap-1.5">
                  <Plus className="w-4 h-4" /> Add Transaction
                </GlassButton>
              </div>
            }
          />

          {isLoading ? (
            <ListSkeleton count={4} />
          ) : (
            <>
              {/* Top Metrics Strip (Space-efficient, compact layout) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <GlassCard className="p-4 flex flex-col justify-between gap-1">
                  <div className="flex items-center justify-between text-muted">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Net Balance</span>
                    <Wallet className="w-4 h-4 text-accent" />
                  </div>
                  <span className="font-display text-xl sm:text-2xl font-black text-foreground tracking-tight">
                    {formatINR(totalBalance)}
                  </span>
                  <span className="text-[10px] text-muted">Across all connected banks</span>
                </GlassCard>

                <GlassCard className="p-4 flex flex-col justify-between gap-1">
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Income</span>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="font-display text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                    +{formatINR(thisMonthIncome)}
                  </span>
                  <span className="text-[10px] text-muted">Deposited this month</span>
                </GlassCard>

                <GlassCard className="p-4 flex flex-col justify-between gap-1">
                  <div className="flex items-center justify-between text-danger">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Expenses</span>
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <span className="font-display text-xl sm:text-2xl font-black text-danger tracking-tight">
                    -{formatINR(thisMonthExpense)}
                  </span>
                  <span className="text-[10px] text-muted">Spent this month</span>
                </GlassCard>

                <GlassCard className="p-4 flex flex-col justify-between gap-1">
                  <div className="flex items-center justify-between text-muted">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Active Banks</span>
                    <Landmark className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="font-display text-xl sm:text-2xl font-black text-foreground tracking-tight">
                    {accounts.length}
                  </span>
                  <span className="text-[10px] text-muted">
                    {accounts.length === 1 ? "1 bank account active" : `${accounts.length} bank accounts active`}
                  </span>
                </GlassCard>
              </div>

              {/* Bank Accounts Grid (Well-proportioned cards, fully utilizes horizontal space) */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-accent" />
                    <h2 className="text-sm font-bold text-foreground">Bank Accounts & Institutions</h2>
                    <GlassBadge variant="default" className="text-[11px] px-1.5 py-0.5">
                      {accounts.length}
                    </GlassBadge>
                  </div>
                  <button
                    onClick={handleOpenAddAccount}
                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Bank
                  </button>
                </div>

                {accounts.length === 0 ? (
                  <GlassPanel className="p-6 text-center flex flex-col items-center justify-center gap-2.5 border-dashed">
                    <Building2 className="w-8 h-8 text-muted opacity-60" />
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-semibold text-foreground">No Indian bank accounts added yet</p>
                      <p className="text-xs text-muted">Add your HDFC, SBI, ICICI, or other bank accounts to manage balances in ₹.</p>
                    </div>
                    <GlassButton variant="primary" size="sm" onClick={handleOpenAddAccount} className="gap-1.5 text-xs">
                      <Plus className="w-3.5 h-3.5" /> Add Bank Account
                    </GlassButton>
                  </GlassPanel>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {accounts.map((acc) => {
                      const colorConfig = COLOR_OPTIONS.find((c) => c.value === acc.color) || COLOR_OPTIONS[0];
                      const TypeIcon = ACCOUNT_TYPES.find((t) => t.value === acc.type)?.icon || Building2;
                      const typeLabel = ACCOUNT_TYPES.find((t) => t.value === acc.type)?.label || acc.type;

                      return (
                        <GlassCard
                          key={acc.id}
                          className={`p-4 flex flex-col justify-between gap-3 border transition-all duration-200 hover:border-accent/40 ${colorConfig.border} bg-card/60 backdrop-blur-md relative overflow-hidden group shadow-sm`}
                        >
                          {/* Top: Bank Logo, Name & Type */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`p-2 rounded-xl shrink-0 ${colorConfig.bg} ${colorConfig.text}`}>
                                <TypeIcon className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-foreground truncate leading-tight">
                                  {acc.bankName || "Bank Account"}
                                </span>
                                <span className="text-[11px] text-muted truncate">{acc.name}</span>
                              </div>
                            </div>
                            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-card/80 border border-card-border/60 text-muted shrink-0">
                              {typeLabel}
                            </span>
                          </div>

                          {/* Middle: Prominent Balance & Masked Account Number */}
                          <div className="flex items-baseline justify-between pt-1">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-muted uppercase font-semibold">Balance</span>
                              <span
                                className={`text-xl font-black font-display tracking-tight ${
                                  acc.type === "credit" && acc.balance > 0 ? "text-danger" : "text-foreground"
                                }`}
                              >
                                {formatINR(acc.balance)}
                              </span>
                            </div>
                            {acc.accountNumber && (
                              <span className="text-[11px] text-muted font-mono bg-card/40 px-1.5 py-0.5 rounded border border-card-border/40">
                                •••• {acc.accountNumber}
                              </span>
                            )}
                          </div>

                          {/* Bottom: Quick Actions Bar */}
                          <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs">
                            <button
                              onClick={() => handleOpenTransferModal(acc.id)}
                              disabled={accounts.length < 2}
                              className="font-semibold text-accent hover:underline flex items-center gap-1 disabled:opacity-30 disabled:no-underline text-[11px]"
                              title="Transfer money from this account"
                            >
                              <ArrowRightLeft className="w-3 h-3" /> Transfer
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditAccount(acc)}
                                className="p-1 text-muted hover:text-foreground hover:bg-card rounded-md transition-colors"
                                title="Edit account details or adjust balance"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteAccountId(acc.id)}
                                className="p-1 text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                                title="Remove bank account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </GlassCard>
                      );
                    })}

                    {/* Compact Add Bank Button Card */}
                    <button
                      onClick={handleOpenAddAccount}
                      className="p-4 rounded-2xl border border-dashed border-card-border/70 hover:border-accent/60 bg-card/20 hover:bg-card/40 transition-all flex flex-col items-center justify-center gap-1.5 text-muted hover:text-foreground min-h-[125px]"
                    >
                      <div className="p-2 rounded-full bg-card border border-card-border/60">
                        <Plus className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-xs font-bold">Add Another Bank</span>
                      <span className="text-[10px] text-muted">HDFC, SBI, ICICI, etc.</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Main Content: Split Grid (Left: Transactions, Right: Bank Allocation & Budgets) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                
                {/* Left (8 cols): Transactions History */}
                <div className="xl:col-span-8 flex flex-col gap-4">
                  <GlassCard className="flex flex-col h-full min-h-[460px]">
                    <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Transactions History
                        </span>
                        <GlassBadge variant="default" className="text-[10px]">
                          {filteredTransactions.length}
                        </GlassBadge>
                      </div>

                      {/* Bank filter pills */}
                      {accounts.length > 0 && (
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                          <Filter className="w-3 h-3 text-muted shrink-0" />
                          <button
                            onClick={() => setSelectedAccountFilter("all")}
                            className={`px-2 py-0.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                              selectedAccountFilter === "all"
                                ? "bg-accent text-accent-foreground font-bold shadow-sm"
                                : "bg-card/60 text-muted hover:text-foreground"
                            }`}
                          >
                            All ({formatINR(totalBalance)})
                          </button>
                          {accounts.map((acc) => (
                            <button
                              key={acc.id}
                              onClick={() => setSelectedAccountFilter(acc.id)}
                              className={`px-2 py-0.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                selectedAccountFilter === acc.id
                                  ? "bg-accent text-accent-foreground font-bold shadow-sm"
                                  : "bg-card/60 text-muted hover:text-foreground"
                              }`}
                            >
                              {acc.bankName || acc.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col p-2 gap-1 overflow-y-auto max-h-[520px]">
                      {filteredTransactions.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center justify-center gap-2 text-muted text-sm">
                          <Coins className="w-8 h-8 opacity-40" />
                          <span className="text-xs">No transactions recorded yet.</span>
                          <button
                            onClick={() => setShowAddTxModal(true)}
                            className="text-accent text-xs font-semibold hover:underline"
                          >
                            + Record a transaction
                          </button>
                        </div>
                      ) : (
                        filteredTransactions.map((tx) => {
                          const txAccountObj = getAccountById(tx.accountId);
                          const isTransfer = tx.category === "Transfer" || tx.type === "transfer";

                          return (
                            <div
                              key={tx.id}
                              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-card/60 transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg shrink-0 ${
                                    isTransfer
                                      ? "bg-blue-500/10 text-blue-400"
                                      : tx.type === "income"
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : "bg-danger/10 text-danger"
                                  }`}
                                >
                                  {isTransfer ? (
                                    <ArrowRightLeft className="w-3.5 h-3.5" />
                                  ) : tx.type === "income" ? (
                                    <TrendingUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <TrendingDown className="w-3.5 h-3.5" />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-foreground">
                                    {tx.description || tx.category}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-[10px] text-muted">
                                    <span>{tx.date}</span>
                                    <span>•</span>
                                    <span>{tx.category}</span>
                                    {txAccountObj ? (
                                      <>
                                        <span>•</span>
                                        <span className="font-semibold text-accent">
                                          {txAccountObj.bankName ? `${txAccountObj.bankName} (${txAccountObj.name})` : txAccountObj.name}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span>•</span>
                                        <span className="text-muted/70 italic">Archived Bank</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`text-xs font-bold font-mono ${
                                    isTransfer
                                      ? tx.type === "income"
                                        ? "text-emerald-400"
                                        : "text-blue-400"
                                      : tx.type === "income"
                                      ? "text-emerald-400"
                                      : "text-foreground"
                                  }`}
                                >
                                  {tx.type === "income" ? "+" : "-"}
                                  {formatINR(tx.amount)}
                                </span>
                                <button
                                  onClick={() => setDeleteTxId(tx.id)}
                                  className="p-1 text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity rounded"
                                  title="Delete transaction"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </GlassCard>
                </div>

                {/* Right (4 cols): Bank Allocation, AI Insights & Budgets */}
                <div className="xl:col-span-4 flex flex-col gap-4">
                  {/* Bank Allocation Breakdown */}
                  <GlassCard className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                        Bank Allocation
                      </span>
                      <Wallet className="w-3.5 h-3.5 text-muted" />
                    </div>
                    <div className="flex flex-col gap-2">
                      {accounts.length === 0 ? (
                        <span className="text-xs text-muted text-center py-2">No bank accounts added</span>
                      ) : (
                        accounts.map((acc) => {
                          const percent = totalBalance > 0 ? Math.max(0, Math.round((acc.balance / totalBalance) * 100)) : 0;
                          return (
                            <div key={acc.id} className="flex flex-col gap-1 p-2 bg-card/40 rounded-xl border border-card-border/40">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-foreground truncate max-w-[140px]">
                                  {acc.bankName || acc.name}
                                </span>
                                <span className="font-bold font-mono">{formatINR(acc.balance)}</span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-muted">
                                <span className="truncate">{acc.name}</span>
                                <span>{percent}%</span>
                              </div>
                              <div className="w-full h-1 bg-card rounded-full overflow-hidden mt-0.5">
                                <div
                                  className="h-full bg-accent rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </GlassCard>

                  {/* AI Financial Insight Card */}
                  <GlassPanel className="p-4 bg-accent/5 border-accent/20 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                        <h3 className="text-xs font-bold text-foreground">AI Spending Insight</h3>
                      </div>
                      {isInsightLoading && <RefreshCw className="w-3 h-3 animate-spin text-muted" />}
                    </div>
                    {insight ? (
                      <div className="flex flex-col gap-1.5">
                        <p className="text-xs font-bold text-accent">{insight.headline}</p>
                        <p className="text-[11px] text-foreground/80 leading-relaxed">{insight.insight}</p>
                        <div className="mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent font-medium">
                            💡 {insight.tip}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted">Log transactions to receive AI budget analysis.</p>
                    )}
                  </GlassPanel>

                  {/* Monthly Budgets */}
                  <GlassCard className="p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Budgets Status</span>
                      <PieChart className="w-3.5 h-3.5 text-muted" />
                    </div>

                    {budgets.length === 0 ? (
                      <div className="text-xs text-muted text-center py-3">No budgets configured yet.</div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {budgets.map((budget) => {
                          const prog = getBudgetProgress(budget.category);
                          if (!prog) return null;
                          const isWarning = prog.percent > 85;
                          const isDanger = prog.percent >= 100;

                          return (
                            <div key={budget.id} className="flex flex-col gap-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-foreground">{budget.category}</span>
                                <span className="text-[11px] text-muted font-mono">
                                  {formatINR(prog.spent)} / {formatINR(prog.limit)}
                                </span>
                              </div>
                              <div className="w-full h-1 bg-card border border-card-border/40 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${prog.percent}%` }}
                                  className={`h-full rounded-full ${
                                    isDanger ? "bg-danger" : isWarning ? "bg-amber-400" : "bg-emerald-400"
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </GlassCard>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* --- Add / Edit Bank Account Modal (Tailored to India, No Currency Friction) --- */}
        <AnimatePresence>
          {showAccountModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAccountModal(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md z-10 max-h-[90vh] overflow-y-auto"
              >
                <GlassPanel className="flex flex-col gap-4 p-5 md:p-6">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-accent" />
                      <h3 className="font-display text-lg font-bold">
                        {editingAccount ? "Edit Bank Account & Balance" : "Add Bank Account"}
                      </h3>
                    </div>
                  </div>

                  {/* Indian Bank Presets */}
                  {!editingAccount && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted">Select Bank</label>
                      <div className="flex flex-wrap gap-1">
                        {INDIAN_BANKS.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              setAccBankName(b);
                              if (!accName) setAccName(`${b} Account`);
                            }}
                            className={`px-2 py-1 rounded-md text-xs border transition-colors ${
                              accBankName === b
                                ? "bg-accent/20 border-accent text-accent font-semibold"
                                : "bg-card/60 border-card-border/50 text-muted hover:text-foreground hover:bg-card"
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-muted">Bank Name</label>
                        <GlassInput
                          placeholder="e.g. HDFC, SBI, Axis"
                          value={accBankName}
                          onChange={(e) => setAccBankName(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-muted">Account Nickname *</label>
                        <GlassInput
                          placeholder="e.g. Salary Account"
                          value={accName}
                          onChange={(e) => setAccName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-muted">Account Type</label>
                        <select
                          value={accType}
                          onChange={(e) => setAccType(e.target.value)}
                          className="w-full bg-card border border-card-border rounded-xl text-xs px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
                        >
                          {ACCOUNT_TYPES.map((t) => (
                            <option key={t.value} value={t.value} className="bg-card text-foreground">
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-muted">
                          {editingAccount ? "Current Balance (₹)" : "Starting Balance (₹)"}
                        </label>
                        <GlassInput
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={accBalance}
                          onChange={(e) => setAccBalance(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-muted">Last 4 Digits of Account (Optional)</label>
                      <GlassInput
                        maxLength={4}
                        placeholder="e.g. 4821"
                        value={accNumber}
                        onChange={(e) => setAccNumber(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>

                    {/* Color Accent Picker */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-muted">Card Theme Color</label>
                      <div className="flex items-center gap-2.5">
                        {COLOR_OPTIONS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => setAccColor(c.value)}
                            className={`w-6 h-6 rounded-full border-2 transition-transform ${
                              accColor === c.value ? "scale-125 border-foreground" : "border-transparent opacity-70"
                            } ${
                              c.value === "blue"
                                ? "bg-blue-500"
                                : c.value === "emerald"
                                ? "bg-emerald-500"
                                : c.value === "purple"
                                ? "bg-purple-500"
                                : c.value === "amber"
                                ? "bg-amber-500"
                                : c.value === "rose"
                                ? "bg-rose-500"
                                : "bg-cyan-500"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 mt-3 pt-3 border-t border-border/40">
                    <GlassButton variant="ghost" size="sm" onClick={() => setShowAccountModal(false)}>
                      Cancel
                    </GlassButton>
                    <GlassButton variant="primary" size="sm" onClick={handleSaveAccount} disabled={isSavingAccount}>
                      {isSavingAccount ? "Saving..." : editingAccount ? "Update Bank" : "Save Bank Account"}
                    </GlassButton>
                  </div>
                </GlassPanel>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- Transfer Funds Modal (Between Indian Banks) --- */}
        <AnimatePresence>
          {showTransferModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowTransferModal(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md z-10"
              >
                <GlassPanel className="flex flex-col gap-4 p-5 md:p-6">
                  <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
                    <ArrowRightLeft className="w-4 h-4 text-accent" />
                    <h3 className="font-display text-lg font-bold">Transfer Between Banks</h3>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-muted">From Bank Account</label>
                      <select
                        value={transferFrom}
                        onChange={(e) => setTransferFrom(e.target.value)}
                        className="w-full bg-card border border-card-border rounded-xl text-xs px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id} className="bg-card text-foreground">
                            {acc.bankName ? `${acc.bankName} - ${acc.name}` : acc.name} (Balance: {formatINR(acc.balance)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-muted">To Bank Account</label>
                      <select
                        value={transferTo}
                        onChange={(e) => setTransferTo(e.target.value)}
                        className="w-full bg-card border border-card-border rounded-xl text-xs px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id} className="bg-card text-foreground">
                            {acc.bankName ? `${acc.bankName} - ${acc.name}` : acc.name} (Balance: {formatINR(acc.balance)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-muted">Transfer Amount (₹)</label>
                        <GlassInput
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-muted">Date</label>
                        <GlassInput
                          type="date"
                          value={transferDate}
                          onChange={(e) => setTransferDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-muted">Note / Description (Optional)</label>
                      <GlassInput
                        placeholder="e.g. Monthly savings, Rent payment"
                        value={transferDesc}
                        onChange={(e) => setTransferDesc(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 mt-3 pt-3 border-t border-border/40">
                    <GlassButton variant="ghost" size="sm" onClick={() => setShowTransferModal(false)}>
                      Cancel
                    </GlassButton>
                    <GlassButton
                      variant="primary"
                      size="sm"
                      onClick={handleTransfer}
                      disabled={isTransferring || !transferAmount || transferFrom === transferTo}
                    >
                      {isTransferring ? "Transferring..." : "Complete Transfer"}
                    </GlassButton>
                  </div>
                </GlassPanel>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- Add Transaction Modal --- */}
        <AnimatePresence>
          {showAddTxModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddTxModal(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md z-10"
              >
                <GlassPanel className="flex flex-col gap-4 p-5 md:p-6">
                  <h3 className="font-display text-lg font-bold">Add Transaction</h3>

                  <div className="flex gap-2 p-1 bg-card/60 rounded-xl border border-card-border/50">
                    <button
                      onClick={() => setTxType("expense")}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors ${
                        txType === "expense" ? "bg-danger/20 text-danger" : "text-muted hover:text-foreground"
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      onClick={() => setTxType("income")}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors ${
                        txType === "income"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      Income
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Select Bank Account */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-muted">Bank Account *</label>
                      {accounts.length === 0 ? (
                        <div className="p-2.5 bg-danger/10 border border-danger/30 rounded-xl text-xs text-danger">
                          Please add a bank account first.
                        </div>
                      ) : (
                        <select
                          value={txAccount}
                          onChange={(e) => setTxAccount(e.target.value)}
                          className="w-full bg-card border border-card-border rounded-xl text-xs px-3 py-2.5 text-foreground focus:outline-none focus:border-accent"
                        >
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id} className="bg-card text-foreground">
                              {acc.bankName ? `${acc.bankName} - ${acc.name}` : acc.name} ({formatINR(acc.balance)})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-muted">Amount (₹)</label>
                        <GlassInput
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={txAmount}
                          onChange={(e) => setTxAmount(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-muted">Date</label>
                        <GlassInput
                          type="date"
                          value={txDate}
                          onChange={(e) => setTxDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-muted">Description</label>
                      <div className="flex gap-2">
                        <GlassInput
                          placeholder="e.g. Swiggy, Groceries, Freelance payment"
                          value={txDesc}
                          onChange={(e) => setTxDesc(e.target.value)}
                        />
                        <GlassButton
                          variant="secondary"
                          onClick={handleAutoCategorize}
                          disabled={!txDesc || isAutoCategorizing}
                          title="AI Auto-Categorize"
                          className="px-2.5 shrink-0"
                        >
                          {isAutoCategorizing ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-accent" />
                          )}
                        </GlassButton>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-muted">Category</label>
                      <GlassInput
                        placeholder="e.g. Food, Utilities, Salary, Travel"
                        value={txCategory}
                        onChange={(e) => setTxCategory(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 mt-3 pt-3 border-t border-border/40">
                    <GlassButton variant="ghost" size="sm" onClick={() => setShowAddTxModal(false)}>
                      Cancel
                    </GlassButton>
                    <GlassButton
                      variant="primary"
                      size="sm"
                      onClick={handleAddTransaction}
                      disabled={!txAmount || !txCategory || !txAccount}
                    >
                      Save Transaction
                    </GlassButton>
                  </div>
                </GlassPanel>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Transaction Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteTxId}
          title="Delete Transaction"
          description="Are you sure? This will update your bank account balance."
          confirmLabel="Delete"
          onConfirm={confirmDeleteTx}
          onCancel={() => setDeleteTxId(null)}
        />

        {/* Delete Bank Account Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteAccountId}
          title="Remove Bank Account"
          description="Are you sure you want to remove this bank account? All your transaction records and history will remain safely preserved."
          confirmLabel="Remove Account"
          onConfirm={confirmDeleteAccount}
          onCancel={() => setDeleteAccountId(null)}
        />
      </PageContainer>
    </AppShell>
  );
}
