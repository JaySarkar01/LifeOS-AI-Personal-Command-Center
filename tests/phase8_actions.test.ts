import assert from "node:assert";
import { AIAction } from "../src/models/domain/AIAction";
import {
  ExecuteActionRequestSchema,
  validateAIAction,
  validateAIActions,
} from "../src/validators/ai-actions";
import { AIActionRateLimiter } from "../src/services/ai/AIActionService";
import { GeminiService } from "../src/services/ai/GeminiService";

async function runPhase8Tests() {
  console.log("🧪 Starting LifeOS Phase 8 AI Action Engine Test Suite...\n");

  // 1. Zod Discriminated Union Validation
  console.log("Testing Zod Discriminated Action Schemas...");

  const validTaskAction = {
    type: "CREATE_TASK",
    payload: {
      title: "Finish LifeOS",
      priority: "high",
      dueDate: "2026-08-15",
    },
    reason: "User requested task",
  };
  const parsedTask = validateAIAction(validTaskAction);
  assert.ok(parsedTask !== null);
  assert.strictEqual(parsedTask.type, "CREATE_TASK");

  const validHabitAction = {
    type: "COMPLETE_HABIT",
    payload: {
      title: "Reading",
      date: "2026-08-14",
    },
  };
  assert.ok(validateAIAction(validHabitAction) !== null);

  const validGoalAction = {
    type: "ADD_GOAL_MILESTONE",
    payload: {
      goalTitle: "Learn Next.js",
      title: "Authentication",
    },
  };
  assert.ok(validateAIAction(validGoalAction) !== null);

  const validDeleteEventAction = {
    type: "DELETE_EVENT",
    payload: {
      title: "Deep Work",
    },
    requiresConfirmation: true,
  };
  assert.ok(validateAIAction(validDeleteEventAction) !== null);

  // Invalid payload (missing required title)
  const invalidAction = {
    type: "CREATE_TASK",
    payload: {},
  };
  assert.strictEqual(validateAIAction(invalidAction), null, "Should reject payload missing title");

  // Invalid type
  const unknownAction = {
    type: "UNKNOWN_ACTION",
    payload: { title: "Test" },
  };
  assert.strictEqual(validateAIAction(unknownAction), null, "Should reject unknown action types");

  console.log("✅ Zod Discriminated Action Schemas passed!");

  // 2. Request Body Schemas (Single & Batch)
  console.log("\nTesting Request Body Batch & Single Action Schemas...");
  const singleReq = ExecuteActionRequestSchema.safeParse({ action: validTaskAction });
  assert.strictEqual(singleReq.success, true);

  const batchReq = ExecuteActionRequestSchema.safeParse({
    actions: [validTaskAction, validHabitAction],
  });
  assert.strictEqual(batchReq.success, true);

  const emptyBatch = ExecuteActionRequestSchema.safeParse({ actions: [] });
  assert.strictEqual(emptyBatch.success, false, "Should reject empty actions array");

  console.log("✅ Request Body Schemas passed!");

  // 3. AIAction Domain Model Status Transitions & Destructive Detection
  console.log("\nTesting AIAction Domain Model Statuses & Destructive Flags...");
  const taskActionEntity = new AIAction({
    type: "CREATE_TASK",
    payload: { title: "Test" },
  });
  assert.strictEqual(taskActionEntity.status, "proposed");
  assert.strictEqual(taskActionEntity.isDestructive(), false);

  taskActionEntity.markExecuting();
  assert.strictEqual(taskActionEntity.status, "executing");

  taskActionEntity.markSuccess("task_123");
  assert.strictEqual(taskActionEntity.status, "success");
  assert.strictEqual(taskActionEntity.resultEntityId, "task_123");

  const deleteActionEntity = new AIAction({
    type: "DELETE_EVENT",
    payload: { title: "Deep Work" },
  });
  assert.strictEqual(deleteActionEntity.isDestructive(), true, "DELETE_EVENT must be flagged as destructive");

  deleteActionEntity.markCancelled();
  assert.strictEqual(deleteActionEntity.status, "cancelled");

  console.log("✅ AIAction Domain Model passed!");

  // 4. Rate Limiter Guard for AI Actions
  console.log("\nTesting AI Action Rate Limiter...");
  AIActionRateLimiter.reset("test_user_rate");
  for (let i = 0; i < 10; i++) {
    assert.strictEqual(
      AIActionRateLimiter.checkLimit("test_user_rate", 10),
      true,
      `Request ${i + 1} should be within limit`
    );
  }
  assert.strictEqual(
    AIActionRateLimiter.checkLimit("test_user_rate", 10),
    false,
    "11th request should be blocked by rate limiter"
  );
  console.log("✅ AI Action Rate Limiter passed!");

  // 5. Multi-Entity Intent Parsing
  console.log("\nTesting Multi-Entity Workspace Intent Parsing...");

  // Regression: Existing task creation intent
  const p1 = "Create a task called Finish LifeOS tomorrow.";
  const i1 = GeminiService.parseWorkspaceActionIntent(p1, "2026-08-14");
  assert.ok(i1 !== null);
  assert.strictEqual(i1.actions.length, 1);
  assert.strictEqual(i1.actions[0].type, "CREATE_TASK");
  assert.strictEqual(i1.actions[0].payload.title, "Finish LifeOS");
  assert.strictEqual(i1.actions[0].payload.dueDate, "2026-08-15");

  // Multi-action breakdown
  const p2 = "Break my portfolio into three tasks.";
  const i2 = GeminiService.parseWorkspaceActionIntent(p2, "2026-08-14");
  assert.ok(i2 !== null);
  assert.strictEqual(i2.actions.length, 3);
  assert.strictEqual(i2.actions[0].type, "CREATE_TASK");

  // Habit completion
  const p3 = "Mark my reading habit complete today.";
  const i3 = GeminiService.parseWorkspaceActionIntent(p3, "2026-08-14");
  assert.ok(i3 !== null);
  assert.strictEqual(i3.actions[0].type, "COMPLETE_HABIT");

  // Schedule event
  const p4 = "Schedule deep work tomorrow at 10 AM";
  const i4 = GeminiService.parseWorkspaceActionIntent(p4, "2026-08-14");
  assert.ok(i4 !== null);
  assert.strictEqual(i4.actions[0].type, "CREATE_EVENT");

  // Delete event
  const p5 = "Delete tomorrow's deep work event";
  const i5 = GeminiService.parseWorkspaceActionIntent(p5, "2026-08-14");
  assert.ok(i5 !== null);
  assert.strictEqual(i5.actions[0].type, "DELETE_EVENT");
  assert.strictEqual(i5.actions[0].requiresConfirmation, true);

  console.log("✅ Multi-Entity Workspace Intent Parsing passed!");

  // 6. Validation Array Filter
  console.log("\nTesting validateAIActions array filter...");
  const rawList = [
    { type: "CREATE_TASK", payload: { title: "Task 1" } },
    { type: "INVALID_ACTION", payload: {} },
    { type: "CREATE_NOTE", payload: { title: "Note 1" } },
  ];
  const validList = validateAIActions(rawList);
  assert.strictEqual(validList.length, 2);
  assert.strictEqual(validList[0].type, "CREATE_TASK");
  assert.strictEqual(validList[1].type, "CREATE_NOTE");

  console.log("✅ validateAIActions array filter passed!");

  console.log("\n🎉 ALL LIFEOS PHASE 8 AI ACTION ENGINE TESTS PASSED SUCCESSFULLY!\n");
}

runPhase8Tests().catch((err) => {
  console.error("❌ Phase 8 Test Failure:", err);
  process.exit(1);
});
