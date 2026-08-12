import { LifeOSTodayContext } from "../types/ai";
import { wrapUntrustedContent } from "./system";

export function buildDayPlannerPrompt(
  context: LifeOSTodayContext,
  availableHours: number,
  focusPreference: string
): string {
  const contextJson = wrapUntrustedContent("USER_LIFEOS_CONTEXT", JSON.stringify(context, null, 2));

  return `
Propose a realistic day plan schedule allocating ${availableHours} focus hours with preference '${focusPreference}'.

${contextJson}

You MUST return valid JSON matching this schema:
{
  "summary": "Brief explanation of the schedule rationale",
  "blocks": [
    {
      "start": "09:00",
      "end": "10:30",
      "type": "deep_work",
      "title": "Block title",
      "reason": "Rationale"
    }
  ]
}
`;
}

export function buildTaskPlannerPrompt(userGoalText: string): string {
  const safeGoal = wrapUntrustedContent("USER_GOAL_INPUT", userGoalText);

  return `
The user wants to achieve the following objective:
${safeGoal}

Break this down into 3-6 concrete, actionable tasks. Do NOT execute or insert them automatically.

You MUST return valid JSON matching this schema:
{
  "planTitle": "A concise title for the task plan",
  "suggestedTasks": [
    {
      "title": "Actionable task title",
      "priority": "medium",
      "reason": "Why this step is necessary"
    }
  ]
}
`;
}
