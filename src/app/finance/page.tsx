"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  type: string;
  balance: number;
  currency: string;
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
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

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
        fetch("/api/finance/transactions?limit=20"),
        fetch("/api/finance/budgets")
      ]);
      
      const accData = await accRes.json();
      const txData = await txRes.json();
      const budData = await budRes.json();

      if (accData.success) setAccounts(accData.data);
      if (txData.success) setTransactions(txData.data);
      if (budData.success) setBudgets(budData.data);

      if (accData.success && accData.data.length === 0) {
        // Create a default account if none exists
        createDefaultAccount();
      } else if (accData.success && accData.data.length > 0) {
        setTxAccount(accData.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDefaultAccount = async () => {
    try {
      const res = await fetch("/api/finance/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Main Checking", type: "checking", balance: 0, currency: "USD" }),
      });
      const data = await res.json();
      if (data.success) {
        setAccounts([data.data]);
        setTxAccount(data.data.id);
      }
    } catch (e) { console.error(e); }
  };

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

  // Actions
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

  const handleAddTransaction = async () => {
    if (!txAmount || !txCategory || !txAccount) return;
    
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
        fetchFinanceData(); // Refresh everything to update balances
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
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
  const thisMonthIncome = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const thisMonthExpense = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);

  const getBudgetProgress = (category: string) => {
    const budget = budgets.find(b => b.category === category);
    if (!budget) return null;
    const spent = transactions
      .filter(t => t.type === "expense" && t.category === category)
      .reduce((acc, t) => acc + t.amount, 0);
    return { spent, limit: budget.limit, percent: Math.min(100, (spent / budget.limit) * 100) };
  };

  return (
    <AppShell>
      <PageContainer>
        <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-8">
          
          {/* Header */}
          <PageHeader
            badge="Wealth Module"
            badgeIcon={CreditCard}
            title="Finance Center"
            description="Track your spending, manage budgets, and let AI provide financial insights."
            actions={
              <GlassButton variant="primary" size="sm" onClick={() => setShowAddTxModal(true)} className="gap-1.5">
                <Plus className="w-4 h-4" /> Add Transaction
              </GlassButton>
            }
          />

          {isLoading ? (
            <ListSkeleton count={4} />
          ) : (
            <>
              {/* Top Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-6 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-muted">
                    <Wallet className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Total Balance</span>
                  </div>
                  <span className="font-display text-3xl font-extrabold text-foreground">
                    ${totalBalance.toFixed(2)}
                  </span>
                </GlassCard>
                <GlassCard className="p-6 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Month Income</span>
                  </div>
                  <span className="font-display text-3xl font-extrabold text-emerald-400">
                    ${thisMonthIncome.toFixed(2)}
                  </span>
                </GlassCard>
                <GlassCard className="p-6 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-danger">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Month Expense</span>
                  </div>
                  <span className="font-display text-3xl font-extrabold text-danger">
                    ${thisMonthExpense.toFixed(2)}
                  </span>
                </GlassCard>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left Col: Transactions & Accounts */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                  
                  {/* AI Insight Card */}
                  <GlassPanel className="p-6 md:p-8 bg-accent/5 border-accent/20">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-accent/20 text-accent rounded-xl">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-foreground">LifeOS Intelligence</h3>
                          {isInsightLoading && <RefreshCw className="w-4 h-4 animate-spin text-muted" />}
                        </div>
                        {insight ? (
                          <>
                            <p className="font-display text-lg font-bold text-accent">{insight.headline}</p>
                            <p className="text-sm text-foreground/80 leading-relaxed">{insight.insight}</p>
                            <div className="mt-2 inline-flex">
                              <GlassBadge variant="accent" className="px-3 py-1 text-xs">💡 Tip: {insight.tip}</GlassBadge>
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-muted">Log transactions to generate AI financial insights.</p>
                        )}
                      </div>
                    </div>
                  </GlassPanel>

                  {/* Transactions List */}
                  <GlassCard className="flex flex-col h-full min-h-[400px]">
                    <div className="p-5 border-b border-border/40 flex items-center justify-between">
                      <span className="text-sm font-bold uppercase tracking-wider text-foreground">Recent Transactions</span>
                    </div>
                    <div className="flex flex-col p-2 gap-1 overflow-y-auto max-h-[500px]">
                      {transactions.length === 0 ? (
                        <div className="p-8 text-center text-muted text-sm">No transactions found. Add one to start tracking!</div>
                      ) : (
                        transactions.map(tx => (
                          <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-card/60 transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-danger/10 text-danger'}`}>
                                {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">{tx.description || tx.category}</span>
                                <span className="text-[10px] text-muted">{tx.date} • {tx.category}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-foreground'}`}>
                                {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                              </span>
                              <button
                                onClick={() => setDeleteTxId(tx.id)}
                                className="p-1.5 text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </GlassCard>
                </div>

                {/* Right Col: Budgets & Accounts Summary */}
                <div className="flex flex-col gap-6">
                  {/* Accounts */}
                  <GlassCard className="p-5 flex flex-col gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">My Accounts</span>
                    <div className="flex flex-col gap-2">
                      {accounts.map(acc => (
                        <div key={acc.id} className="flex justify-between items-center p-3 bg-card/40 rounded-xl border border-card-border/50">
                          <span className="text-sm font-medium">{acc.name}</span>
                          <span className="text-sm font-bold">${acc.balance.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Budgets */}
                  <GlassCard className="p-5 flex flex-col gap-4 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted">Budget Status</span>
                      <PieChart className="w-4 h-4 text-muted" />
                    </div>
                    
                    {budgets.length === 0 ? (
                      <div className="text-xs text-muted text-center py-6">No budgets set.</div>
                    ) : (
                      <div className="flex flex-col gap-5">
                        {budgets.map(budget => {
                          const prog = getBudgetProgress(budget.category);
                          if (!prog) return null;
                          const isWarning = prog.percent > 85;
                          const isDanger = prog.percent >= 100;
                          
                          return (
                            <div key={budget.id} className="flex flex-col gap-2">
                              <div className="flex justify-between items-end">
                                <span className="text-sm font-medium">{budget.category}</span>
                                <span className="text-xs text-muted">
                                  ${prog.spent.toFixed(0)} / ${prog.limit.toFixed(0)}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-card border border-card-border/50 rounded-full overflow-hidden">
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

        {/* --- Add Transaction Modal --- */}
        <AnimatePresence>
          {showAddTxModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowAddTxModal(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md z-10"
              >
                <GlassPanel className="flex flex-col gap-6 p-6 md:p-8">
                  <h3 className="font-display text-xl font-bold">Add Transaction</h3>
                  
                  <div className="flex gap-2 p-1 bg-card/60 rounded-xl border border-card-border/50">
                    <button
                      onClick={() => setTxType("expense")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${txType === 'expense' ? 'bg-danger/20 text-danger' : 'text-muted hover:text-foreground'}`}
                    >
                      Expense
                    </button>
                    <button
                      onClick={() => setTxType("income")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${txType === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'text-muted hover:text-foreground'}`}
                    >
                      Income
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-muted">Amount</label>
                        <GlassInput type="number" step="0.01" placeholder="0.00" value={txAmount} onChange={e => setTxAmount(e.target.value)} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-muted">Date</label>
                        <GlassInput type="date" value={txDate} onChange={e => setTxDate(e.target.value)} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted">Description</label>
                      <div className="flex gap-2">
                        <GlassInput placeholder="e.g. Uber ride to airport" value={txDesc} onChange={e => setTxDesc(e.target.value)} />
                        <GlassButton 
                          variant="secondary" 
                          onClick={handleAutoCategorize} 
                          disabled={!txDesc || isAutoCategorizing}
                          title="AI Auto-Categorize"
                          className="px-3"
                        >
                          {isAutoCategorizing ? <RefreshCw className="w-4 h-4 animate-spin text-accent" /> : <Sparkles className="w-4 h-4 text-accent" />}
                        </GlassButton>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-muted">Category</label>
                      <GlassInput placeholder="e.g. Transport" value={txCategory} onChange={e => setTxCategory(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border/40">
                    <GlassButton variant="ghost" onClick={() => setShowAddTxModal(false)}>Cancel</GlassButton>
                    <GlassButton variant="primary" onClick={handleAddTransaction} disabled={!txAmount || !txCategory}>Save Transaction</GlassButton>
                  </div>
                </GlassPanel>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteTxId}
          title="Delete Transaction"
          description="Are you sure? This will update your account balance."
          confirmLabel="Delete"
          onConfirm={confirmDeleteTx}
          onCancel={() => setDeleteTxId(null)}
        />
      </PageContainer>
    </AppShell>
  );
}
