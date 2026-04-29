import { describe, expect, it } from "vitest";
import { generateApplication } from "@/lib/compiler/pipeline";
import { repairSpec } from "@/lib/compiler/repair";
import { validateSpec } from "@/lib/compiler/validation";
import { AppSpecSchema } from "@/lib/compiler/schemas";
import { evaluationPrompts } from "@/lib/eval/dataset";

/**
 * Comprehensive Test Suite for AI App Compiler
 * 
 * These tests verify:
 * 1. Core functionality    → Generates valid, executable specs
 * 2. Edge cases            → Handles duplicates, conflicts, vagueness
 * 3. Repair logic          → Actually fixes broken specs
 * 4. Determinism           → Evaluation dataset stays size 20
 * 5. Mid-way changes       → Can modify existing specs
 * 
 * All tests use 'fallback' mode (deterministic, no API keys).
 * This proves the system works reliably WITHOUT LLMs.
 * 
 * Why these tests?
 * - CRM test: Realistic complex spec (multiple entities, roles, features)
 * - Duplicate ID test: Common bug in generation
 * - Conflict test: Proves system handles real-world messiness
 * - Repair test: Proves validation + repair actually works
 * - Dataset size: Ensures evaluation remains comprehensive
 * - Mid-way test: Ensures incremental updates work correctly
 */
describe("AI app compiler", () => {
  it("generates a valid executable CRM spec", async () => {
    // Full pipeline test on realistic CRM prompt
    // Should generate: 2+ tables, 5+ endpoints, valid schema
    const run = await generateApplication({
      mode: "fallback",
      prompt:
        "Build a CRM with login, contacts, deals, dashboard, role-based access, premium plan with payments, and admin analytics."
    });

    expect(run.providerMode).toBe("fallback");
    expect(run.validation.valid).toBe(true);
    expect(run.spec.executionReport.runnable).toBe(true);
    expect(run.spec.database.tables.some((table) => table.name === "contacts")).toBe(true);
    expect(run.spec.api.endpoints.length).toBeGreaterThan(5);
    expect(AppSpecSchema.safeParse(run.spec).success).toBe(true);
  });

  it("does not generate duplicate page ids when analytics is requested", async () => {
    const run = await generateApplication({
      mode: "fallback",
      prompt: "Build a CRM with contacts, dashboard, premium payments, and admin analytics."
    });
    const pageIds = run.spec.ui.pages.map((page) => page.id);

    expect(pageIds).toContain("page_analytics");
    expect(new Set(pageIds).size).toBe(pageIds.length);
  });

  it("documents conflicting requirements without breaking execution", async () => {
    const run = await generateApplication({
      mode: "fallback",
      prompt: "Build a dashboard with login and role access, but no login and no auth should exist."
    });

    expect(run.spec.executionReport.status).toBe("clarification_needed");
    expect(run.spec.executionReport.runnable).toBe(true);
    expect(run.validation.issues.some((issue) => issue.code === "CONFLICTING_REQUIREMENT")).toBe(true);
  });

  it("repairs missing database fields referenced by API or UI", async () => {
    const run = await generateApplication({
      mode: "fallback",
      prompt: "Build a CRM with contacts and dashboard."
    });
    const broken = structuredClone(run.spec);
    const contacts = broken.database.tables.find((table) => table.name === "contacts");
    expect(contacts).toBeTruthy();
    contacts!.columns = contacts!.columns.filter((column) => column.name !== "status");

    const validation = validateSpec(broken);
    expect(validation.valid).toBe(false);

    const repaired = repairSpec(broken, validation.issues, 1);
    const repairedValidation = validateSpec(repaired.spec);
    expect(repairedValidation.valid).toBe(true);
    expect(repaired.repairs.some((repair) => repair.action === "add_missing_column")).toBe(true);
  });

  it("keeps evaluation dataset at the required size", () => {
    expect(evaluationPrompts.filter((item) => item.category === "product")).toHaveLength(10);
    expect(evaluationPrompts.filter((item) => item.category === "edge")).toHaveLength(10);
  });

  it("handles mid-way requirement modification", async () => {
    const first = await generateApplication({
      mode: "fallback",
      prompt: "Build a project management tool with tasks and projects."
    });

    const second = await generateApplication({
      mode: "fallback",
      prompt: first.prompt,
      previousSpec: first.spec,
      changeRequest: "Add admin analytics and premium exports."
    });

    expect(second.intent.assumptions.some((assumption) => assumption.includes("Previous generated spec"))).toBe(true);
    expect(second.spec.ui.pages.some((page) => page.path.includes("analytics"))).toBe(true);
    expect(second.spec.database.tables.some((table) => table.name === "analytics_events")).toBe(true);
  });
});
