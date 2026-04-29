import { createArchitecture } from "./design";
import { generateAppSpec } from "./generator";
import { extractIntent } from "./intent";
import { hasOpenAI, generateDesignWithOpenAI, generateIntentWithOpenAI, generateSpecWithOpenAI } from "./openai";
import { hasGemini, generateDesignWithGemini, generateIntentWithGemini, generateSpecWithGemini } from "./gemini";
import { refineSpec } from "./refine";
import { repairSpec } from "./repair";
import { compileRuntime } from "./runtime";
import { BuildResultSchema } from "./schemas";
import type { BuildRequest, BuildResult, ProviderMode, RepairAction, StageResult, ValidationIssue } from "./types";
import { nowIso } from "./utils";
import { validateSpec } from "./validation";

/**
 * Orchestrates the build process for a new application.
 */
export async function startBuild(request: BuildRequest): Promise<BuildResult> {
  const started = Date.now();
  const stages: StageResult[] = [];
  const selectedMode = pickProviderMode(request.mode);
  let providerMode: ProviderMode = selectedMode;
  let retries = 0;
  let providerFailed = false;

  const runStage = async <T>(name: string, summary: string, fn: () => Promise<T> | T): Promise<T> => {
    const timestamp = nowIso();
    try {
      const result = await fn();
      stages.push({ name, status: "ok", startedAt: timestamp, endedAt: nowIso(), summary });
      return result;
    } catch (error) {
      stages.push({
        name,
        status: "failed",
        startedAt: timestamp,
        endedAt: nowIso(),
        summary: error instanceof Error ? error.message : "Internal error"
      });
      throw error;
    }
  };

  // 1. Requirement Analysis
  let intent = await runStage("Intent Analysis", "Extracting requirements from prompt.", async () => {
    const combinedPrompt = `${request.prompt}\n${request.changeRequest ?? ""}`.trim();
    if (selectedMode === "gemini") {
      try { return await generateIntentWithGemini(combinedPrompt); } catch { providerFailed = true; }
    } else if (selectedMode === "openai") {
      try { return await generateIntentWithOpenAI(combinedPrompt); } catch { providerFailed = true; }
    }
    return extractIntent(request);
  });

  if (request.previousSpec && request.changeRequest) {
    intent.assumptions.push("Merging with previous build configuration.");
  }

  // 2. Architectural Design
  const design = await runStage("Architecture", "Designing system entities and flows.", async () => {
    if (!providerFailed && selectedMode === "gemini") {
      try { return await generateDesignWithGemini(intent); } catch { providerFailed = true; }
    } else if (!providerFailed && selectedMode === "openai") {
      try { return await generateDesignWithOpenAI(intent); } catch { providerFailed = true; }
    }
    return createArchitecture(intent);
  });

  // 3. Specification Generation
  let spec = await runStage("Spec Generation", "Compiling application schemas.", async () => {
    if (!providerFailed && selectedMode === "gemini") {
      try { return await generateSpecWithGemini(design); } catch { providerFailed = true; }
    } else if (!providerFailed && selectedMode === "openai") {
      try { return await generateSpecWithOpenAI(design); } catch { providerFailed = true; }
    }
    return generateAppSpec(design);
  });

  if (providerFailed) providerMode = "fallback";

  // 4. Normalization
  spec = await runStage("Refinement", "Aligning data models and UI components.", () => refineSpec(spec));

  // 5. Quality Assurance & Self-Repair
  let validation = validateSpec(spec);
  const repairs: RepairAction[] = [];
  const preRepairIssueCount = validation.issues.length;

  for (let pass = 1; pass <= 2 && !validation.valid; pass++) {
    retries = pass;
    const result = repairSpec(spec, validation.issues, pass);
    spec = refineSpec(result.spec);
    repairs.push(...result.repairs);
    validation = validateSpec(spec);
  }

  if (intent.conflicts.length > 0) {
    const conflictIssues: ValidationIssue[] = intent.conflicts.map((c, i) => ({
      id: `conflict_${i + 1}`,
      stage: "intent",
      severity: "low",
      kind: "ambiguity",
      code: "CONFLICT_DETECTED",
      path: "intent.conflicts",
      message: c,
      repairable: false
    }));
    validation.issues.push(...conflictIssues);
    spec.executionReport.status = "clarification_needed";
  }

  stages.push({
    name: "Integrity Check",
    status: repairs.length ? "repaired" : "ok",
    startedAt: nowIso(),
    endedAt: nowIso(),
    summary: `${preRepairIssueCount} issues identified, ${repairs.length} resolved.`
  });

  // 6. Runtime Preparation
  spec = await runStage("Finalization", "Preparing specification for execution.", () => compileRuntime(spec));

  const latencyMs = Date.now() - started;
  const buildResult: BuildResult = {
    id: `build_${started}`,
    prompt: request.prompt,
    providerMode,
    stages,
    intent,
    design,
    spec,
    validation,
    repairs,
    metrics: {
      latencyMs,
      validationIssueCount: validation.issues.length,
      repairCount: repairs.length,
      retries,
      providerMode,
      estimatedCostUsd: providerMode === "fallback" ? 0 : calculateCost(request.prompt.length),
      failureTypes: validation.issues.map((i) => i.code)
    }
  };

  return BuildResultSchema.parse(buildResult);
}

function pickProviderMode(mode: BuildRequest["mode"]): ProviderMode {
  if (mode === "fallback") return "fallback";
  if (mode === "gemini") return hasGemini() ? "gemini" : "fallback";
  if (mode === "openai") return hasOpenAI() ? "openai" : "fallback";
  return hasGemini() ? "gemini" : (hasOpenAI() ? "openai" : "fallback");
}

function calculateCost(chars: number) {
  const tokens = Math.max(250, Math.ceil(chars / 4) + 1800);
  return Number(((tokens / 1_000_000) * 5 + (900 / 1_000_000) * 30).toFixed(6));
}
