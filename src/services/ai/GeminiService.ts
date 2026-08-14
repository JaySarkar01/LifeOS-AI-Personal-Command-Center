import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "./ai.config";
import { SYSTEM_BASE_PROMPT, wrapUntrustedContent } from "./prompts/system";
import { buildInsightPrompt, buildDailySummaryPrompt } from "./prompts/insight";
import { buildDayPlannerPrompt, buildTaskPlannerPrompt } from "./prompts/planner";
import { buildGoalCoachPrompt, buildHabitCoachPrompt } from "./prompts/coach";
import { LifeOSTodayContext, AIInsightResult, AIDailySummaryResult, AIDayPlanResult, AITaskPlanResult, AIGoalCoachResult, AIHabitCoachResult } from "./types/ai";

// Simple in-memory rate limiting map
const userRateLimits = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, limit = AI_CONFIG.maxChatRequestsPerMinute): boolean {
  const now = Date.now();
  const userRecord = userRateLimits.get(userId);

  if (!userRecord || now > userRecord.resetTime) {
    userRateLimits.set(userId, { count: 1, resetTime: now + AI_CONFIG.rateLimitWindowMs });
    return true;
  }

  if (userRecord.count >= limit) {
    return false;
  }

  userRecord.count++;
  return true;
}

export class GeminiService {
  private static getAIInstance(): GoogleGenAI | null {
    const apiKey = AI_CONFIG.apiKey;
    if (!apiKey || apiKey === "placeholder_gemini_api_key") {
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Safe JSON parser helper with fallback.
   */
  private static parseJson<T>(text: string): T | null {
    try {
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }

  public static parseTaskCreationIntent(prompt: string, todayDateStr: string) {
    let cleaned = prompt.trim().replace(/\.$/, "");
    
    // Check if it's a task creation intent
    const isTaskCreation = /^(?:create|add)\s+(?:a\s+)?task\s+(?:called\s+)?/i.test(cleaned);
    if (!isTaskCreation) return null;
    
    // Remove the prefix
    cleaned = cleaned.replace(/^(?:create|add)\s+(?:a\s+)?task\s+(?:called\s+)?/i, "");
    
    // Remove wrapping quotes if present
    cleaned = cleaned.replace(/^["']|["']$/g, "").trim();
    
    // Check for suffix " tomorrow" or " today"
    let when = "";
    if (cleaned.toLowerCase().endsWith(" tomorrow")) {
      when = "tomorrow";
      cleaned = cleaned.substring(0, cleaned.length - " tomorrow".length).trim();
    } else if (cleaned.toLowerCase().endsWith(" today")) {
      when = "today";
      cleaned = cleaned.substring(0, cleaned.length - " today".length).trim();
    }
    
    // Clean any trailing quotes after removing suffix
    const title = cleaned.replace(/^["']|["']$/g, "").trim();
    
    let dueDate = todayDateStr;
    if (when === "tomorrow") {
      const date = new Date(todayDateStr + "T00:00:00");
      date.setDate(date.getDate() + 1);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      dueDate = `${yyyy}-${mm}-${dd}`;
    }
    
    return {
      title,
      dueDate,
      priority: "medium",
    };
  }

  /**
   * Generates conversational AI chat response with context awareness.
   */
  public static async generateChatResponse(
    userId: string,
    userPrompt: string,
    context: LifeOSTodayContext,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    if (!checkRateLimit(userId)) {
      return "Rate limit exceeded. Please wait a moment before asking LifeOS Intelligence again.";
    }

    const ai = this.getAIInstance();
    const contextSnippet = wrapUntrustedContent("USER_LIFEOS_CONTEXT", JSON.stringify(context, null, 2));

    if (!ai) {
      // Check if task creation intent is present in the prompt
      const todayDateStr = context.date || new Date().toISOString().split("T")[0];
      const taskIntent = this.parseTaskCreationIntent(userPrompt, todayDateStr);
      if (taskIntent) {
        return JSON.stringify({
          content: `[LifeOS Intelligence Demo Mode] I have prepared a suggested action to create the task "${taskIntent.title}".`,
          suggestedAction: {
            type: "CREATE_TASK",
            data: {
              title: taskIntent.title,
              dueDate: taskIntent.dueDate,
              priority: taskIntent.priority,
            },
          },
        });
      }

      // Graceful fallback response when API key is unconfigured
      return `[LifeOS Intelligence Demo Mode]\n\nBased on your current context (${context.tasks.length} tasks, ${context.habits.length} habits):\nYour top focus should be: "${context.tasks[0]?.title || "Review your daily goals"}". You have ${context.schedule.length} events scheduled today.`;
    }

    try {
      const systemMessage = `${SYSTEM_BASE_PROMPT}\n\nCurrent User Workspace Context:\n${contextSnippet}`;
      
      const historyPrompt = conversationHistory
        .slice(-4)
        .map((h) => `${h.role.toUpperCase()}: ${h.content}`)
        .join("\n");

      const fullPrompt = `${systemMessage}\n\nRecent Conversation:\n${historyPrompt}\n\nUSER QUESTION: ${userPrompt}`;

      const response = await ai.models.generateContent({
        model: AI_CONFIG.model,
        contents: fullPrompt,
      });

      return response.text || "LifeOS Intelligence was unable to generate a response.";
    } catch (err: unknown) {
      console.error("GeminiService Chat Error:", err);
      return "LifeOS Intelligence is temporarily unavailable. Your productivity data is safe. Please try again in a moment.";
    }
  }

  /**
   * Generates Daily AI Insight for Dashboard.
   */
  public static async generateInsight(userId: string, context: LifeOSTodayContext): Promise<AIInsightResult> {
    const ai = this.getAIInstance();
    const prompt = buildInsightPrompt(context);

    const fallback: AIInsightResult = {
      headline: "Protect Your Morning Focus",
      insight: `You have ${context.tasks.length} active tasks today. Completing high-priority items first will build strong momentum.`,
      actionableTip: "Dedicating a 90-minute block for your main task will increase throughput by 40%.",
    };

    if (!ai) return fallback;

    try {
      const res = await ai.models.generateContent({
        model: AI_CONFIG.model,
        contents: `${SYSTEM_BASE_PROMPT}\n${prompt}`,
      });

      const parsed = this.parseJson<AIInsightResult>(res.text || "");
      return parsed && parsed.headline && parsed.insight ? parsed : fallback;
    } catch (err) {
      console.error("GeminiService Insight Error:", err);
      return fallback;
    }
  }

  /**
   * Generates Daily Summary.
   */
  public static async generateDailySummary(userId: string, context: LifeOSTodayContext): Promise<AIDailySummaryResult> {
    const ai = this.getAIInstance();
    const prompt = buildDailySummaryPrompt(context);

    const fallback: AIDailySummaryResult = {
      summary: `You have ${context.tasks.length} active tasks and ${context.schedule.length} scheduled events today.`,
      priorities: context.tasks.slice(0, 2).map((t) => ({ title: t.title, reason: `Priority: ${t.priority}` })),
      warnings: [],
      suggestions: ["Focus on completing your top priority task before noon."],
    };

    if (!ai) return fallback;

    try {
      const res = await ai.models.generateContent({
        model: AI_CONFIG.model,
        contents: `${SYSTEM_BASE_PROMPT}\n${prompt}`,
      });

      const parsed = this.parseJson<AIDailySummaryResult>(res.text || "");
      return parsed || fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Generates Day Plan.
   */
  public static async generateDayPlan(
    userId: string,
    context: LifeOSTodayContext,
    availableHours: number,
    focusPreference: string
  ): Promise<AIDayPlanResult> {
    const ai = this.getAIInstance();
    const prompt = buildDayPlannerPrompt(context, availableHours, focusPreference);

    const fallback: AIDayPlanResult = {
      summary: `Allocating ${availableHours} hours with preference for ${focusPreference}.`,
      blocks: [
        {
          start: "09:00",
          end: "10:30",
          type: "deep_work",
          title: context.tasks[0]?.title || "Core Priority Block",
          reason: "Highest priority item",
        },
      ],
    };

    if (!ai) return fallback;

    try {
      const res = await ai.models.generateContent({
        model: AI_CONFIG.model,
        contents: `${SYSTEM_BASE_PROMPT}\n${prompt}`,
      });

      const parsed = this.parseJson<AIDayPlanResult>(res.text || "");
      return parsed || fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Generates Task Breakdown Plan for user confirmation.
   */
  public static async generateTaskPlan(userId: string, userGoalText: string): Promise<AITaskPlanResult> {
    const ai = this.getAIInstance();
    const prompt = buildTaskPlannerPrompt(userGoalText);

    const fallback: AITaskPlanResult = {
      planTitle: "Suggested Task Breakdown",
      suggestedTasks: [
        { title: `Initial preparation for ${userGoalText}`, priority: "high", reason: "Foundational step" },
        { title: `Execute main work on ${userGoalText}`, priority: "medium", reason: "Core execution" },
        { title: `Review and finalize ${userGoalText}`, priority: "low", reason: "Quality check" },
      ],
    };

    if (!ai) return fallback;

    try {
      const res = await ai.models.generateContent({
        model: AI_CONFIG.model,
        contents: `${SYSTEM_BASE_PROMPT}\n${prompt}`,
      });

      const parsed = this.parseJson<AITaskPlanResult>(res.text || "");
      return parsed || fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Generates Summarized Note Content.
   */
  public static async summarizeNote(userId: string, noteTitle: string, noteContent: string): Promise<string> {
    const ai = this.getAIInstance();
    if (!ai) {
      return `Summary of "${noteTitle}":\nKey points: ${noteContent.substring(0, 150)}...`;
    }

    try {
      const safeTitle = wrapUntrustedContent("NOTE_TITLE", noteTitle);
      const safeContent = wrapUntrustedContent("NOTE_CONTENT", noteContent);

      const res = await ai.models.generateContent({
        model: AI_CONFIG.model,
        contents: `${SYSTEM_BASE_PROMPT}\nSummarize the following note into concise bullet points:\n${safeTitle}\n${safeContent}`,
      });

      return res.text || "Unable to summarize note.";
    } catch {
      return "Note summarization is temporarily unavailable.";
    }
  }

  /**
   * Generates Goal Coaching Advice.
   */
  public static async coachGoal(userId: string, goalData: unknown): Promise<AIGoalCoachResult> {
    const ai = this.getAIInstance();
    const prompt = buildGoalCoachPrompt(goalData);

    const fallback: AIGoalCoachResult = {
      status: "Goal is currently active.",
      whatIsGoingWell: "You have clear milestones established.",
      blockers: "Pacing may require dedicated time slots.",
      recommendedNextStep: "Complete the first active milestone step today.",
    };

    if (!ai) return fallback;

    try {
      const res = await ai.models.generateContent({
        model: AI_CONFIG.model,
        contents: `${SYSTEM_BASE_PROMPT}\n${prompt}`,
      });

      const parsed = this.parseJson<AIGoalCoachResult>(res.text || "");
      return parsed || fallback;
    } catch {
      return fallback;
    }
  }

  /**
   * Generates Habit Coaching Advice.
   */
  public static async coachHabit(userId: string, habitData: unknown): Promise<AIHabitCoachResult> {
    const ai = this.getAIInstance();
    const prompt = buildHabitCoachPrompt(habitData);

    const fallback: AIHabitCoachResult = {
      habitTitle: "Habit Tracker Rationale",
      currentStreak: 0,
      assessment: "Consistent execution builds automatic routine behavior.",
      practicalSuggestions: [
        "Attach this habit to an existing anchor routine (e.g. after morning coffee).",
        "Keep initial session length short to build momentum.",
      ],
    };

    if (!ai) return fallback;

    try {
      const res = await ai.models.generateContent({
        model: AI_CONFIG.model,
        contents: `${SYSTEM_BASE_PROMPT}\n${prompt}`,
      });

      const parsed = this.parseJson<AIHabitCoachResult>(res.text || "");
      return parsed || fallback;
    } catch {
      return fallback;
    }
  }
}
