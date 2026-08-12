import { LifeOSTodayContext } from "../types/ai";
import { wrapUntrustedContent } from "./system";

export function buildInsightPrompt(context: LifeOSTodayContext): string {
  const contextJson = wrapUntrustedContent("USER_LIFEOS_CONTEXT", JSON.stringify(context, null, 2));

  return `
Analyze the user's current LifeOS state and generate a single daily productivity insight.

${contextJson}

You MUST return your answer in valid JSON format matching this schema:
{
  "headline": "A short 4-8 word energetic headline",
  "insight": "A 2-3 sentence analysis of their current tasks, habit consistency, or schedule alignment",
  "actionableTip": "One specific, highly practical action to take today"
}
`;
}

export function buildDailySummaryPrompt(context: LifeOSTodayContext): string {
  const contextJson = wrapUntrustedContent("USER_LIFEOS_CONTEXT", JSON.stringify(context, null, 2));

  return `
Generate a structured daily summary for the user based on their active tasks, habits, goals, and schedule.

${contextJson}

You MUST return your answer in valid JSON format matching this schema:
{
  "summary": "A brief overview of their day",
  "priorities": [
    { "title": "Priority item title", "reason": "Why this is critical today" }
  ],
  "warnings": ["Any potential scheduling conflicts or overdue tasks"],
  "suggestions": ["1-2 practical tips for focus"]
}
`;
}
