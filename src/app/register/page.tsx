"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, AlertCircle } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { pageTransition } from "@/lib/motion";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || "Registration failed");
        setIsLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred during registration");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,var(--color-accent)_0%,transparent_70%)] opacity-[0.08] blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,var(--color-accent-secondary)_0%,transparent_70%)] opacity-[0.08] blur-[140px] pointer-events-none" />

      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-md"
      >
        <GlassPanel className="p-8 md:p-10 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-accent-foreground font-display font-extrabold text-base shadow-glass mb-1">
              ◈
            </div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
              Create LifeOS Account
            </h1>
            <p className="text-xs text-muted">
              Start building your personal productivity command center
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
                Full Name
              </label>
              <GlassInput
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jay Sarkar"
              />
            </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase text-muted tracking-wider">
                Confirm Password
              </label>
              <GlassInput
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full mt-2 justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {isLoading ? "Creating Account..." : "Create Account"}
            </GlassButton>
          </form>

          {/* Footer */}
          <div className="text-center pt-2 text-xs text-muted border-t border-border/40">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-accent hover:underline">
              Sign in
            </Link>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
