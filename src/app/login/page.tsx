"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { LogIn, AlertCircle } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { pageTransition } from "@/lib/motion";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <GlassPanel className="p-8 md:p-10 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <Link href="/" className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-accent-foreground font-display font-extrabold text-base shadow-glass mb-1 hover:scale-105 transition-transform">
          ◈
        </Link>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          Welcome Back to LifeOS
        </h1>
        <p className="text-xs text-muted">
          Enter your credentials to access your personal command center
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase text-muted tracking-wider">
            Email Address
          </label>
          <GlassInput
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase text-muted tracking-wider">
            Password
          </label>
          <GlassInput
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <GlassButton
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="w-full mt-2 justify-center gap-2 shadow-glass"
        >
          <LogIn className="w-4 h-4" />
          {isLoading ? "Signing in..." : "Sign In"}
        </GlassButton>
      </form>

      {/* Footer */}
      <div className="text-center pt-2 text-xs text-muted border-t border-border/40 flex flex-col gap-2">
        <div>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-accent hover:underline">
            Create one
          </Link>
        </div>
        <Link href="/" className="text-[11px] text-muted hover:text-foreground">
          ← Back to Public Overview
        </Link>
      </div>
    </GlassPanel>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,var(--color-accent)_0%,transparent_70%)] opacity-[0.08] blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,var(--color-accent-secondary)_0%,transparent_70%)] opacity-[0.08] blur-[140px] pointer-events-none" />

      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-md"
      >
        <Suspense fallback={<div className="p-8 text-center text-xs text-muted">Loading login...</div>}>
          <LoginForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
