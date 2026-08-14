"use client";

import React, { useState } from "react";

export interface DashboardHeaderProps {
  userName?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  return new Date().toLocaleDateString("en-US", options).toUpperCase();
}

export function DashboardHeader({ userName = "User" }: DashboardHeaderProps) {
  const [greeting] = useState<string>(() => getGreeting());
  const [formattedDate] = useState<string>(() => getFormattedDate());

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold text-muted tracking-widest uppercase">
        {formattedDate}
      </span>
      <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
        {greeting}, {userName}.
      </h1>
      <p className="text-xs md:text-sm text-muted">
        Here&apos;s what deserves your attention today.
      </p>
    </div>
  );
}
