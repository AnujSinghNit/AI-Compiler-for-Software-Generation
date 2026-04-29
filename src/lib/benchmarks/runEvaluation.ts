import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { generateApplication } from "@/lib/compiler/pipeline";
import { EvalReportSchema } from "@/lib/compiler/schemas";
import type { EvalReport, GenerateMode } from "@/lib/compiler/types";
import { evaluationPrompts } from "./dataset";

export async function runEvaluation(options: { mode: GenerateMode; writeArtifacts: boolean }): Promise<EvalReport> {
  const results = [];

  for (const item of evaluationPrompts) {
    const run = await generateApplication({ prompt: item.prompt, mode: options.mode });
    const clarificationNeeded = run.spec.executionReport.status === "clarification_needed";
    results.push({
      id: item.id,
      prompt: item.prompt,
      category: item.category,
      success: run.validation.valid && run.spec.executionReport.runnable,
      latencyMs: run.metrics.latencyMs,
      repairCount: run.metrics.repairCount,
      validationIssueCount: run.metrics.validationIssueCount,
      failureTypes: run.metrics.failureTypes,
      providerMode: run.metrics.providerMode,
      clarificationNeeded
    });
  }

  const total = results.length;
  const successCount = results.filter((result) => result.success).length;
  const failureTypes = results
    .flatMap((result) => result.failureTypes)
    .reduce<Record<string, number>>((acc, type) => {
      acc[type] = (acc[type] ?? 0) + 1;
      return acc;
    }, {});
  const providerModes = results.reduce<Record<string, number>>((acc, result) => {
    acc[result.providerMode] = (acc[result.providerMode] ?? 0) + 1;
    return acc;
  }, {});

  const report: EvalReport = {
    generatedAt: new Date().toISOString(),
    summary: {
      total,
      successRate: total ? successCount / total : 0,
      averageLatencyMs: Math.round(results.reduce((sum, result) => sum + result.latencyMs, 0) / Math.max(total, 1)),
      averageRepairs: results.reduce((sum, result) => sum + result.repairCount, 0) / Math.max(total, 1),
      clarificationNeeded: results.filter((result) => result.clarificationNeeded).length,
      providerModes,
      failureTypes
    },
    results
  };

  const parsed = EvalReportSchema.parse(report);

  if (options.writeArtifacts) {
    await writeArtifacts(parsed);
  }

  return parsed;
}

async function writeArtifacts(report: EvalReport) {
  const artifactDir = join(process.cwd(), "artifacts");
  await mkdir(artifactDir, { recursive: true });
  await writeFile(join(artifactDir, "evaluation-results.json"), JSON.stringify(report, null, 2), "utf8");
  await writeFile(join(artifactDir, "evaluation-report.md"), renderMarkdown(report), "utf8");
}

function renderMarkdown(report: EvalReport) {
  const rows = report.results
    .map(
      (result) =>
        `| ${result.id} | ${result.category} | ${result.providerMode} | ${result.success ? "pass" : "review"} | ${result.latencyMs} | ${result.repairCount} | ${result.validationIssueCount} | ${result.failureTypes.join(", ") || "none"} |`
    )
    .join("\n");

  return `# Evaluation Report

Generated: ${report.generatedAt}

## Summary

OpenAI is optional. The core evaluation is reliability, validation, repair, and runtime execution.

- Total prompts: ${report.summary.total}
- Success rate: ${Math.round(report.summary.successRate * 100)}%
- Average latency: ${report.summary.averageLatencyMs}ms
- Average repairs: ${report.summary.averageRepairs.toFixed(2)}
- Clarification needed: ${report.summary.clarificationNeeded}

## Provider Modes

${Object.entries(report.summary.providerModes)
  .map(([mode, count]) => `- ${mode}: ${count}`)
  .join("\n") || "- none"}

## Failure Types

${Object.entries(report.summary.failureTypes)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join("\n") || "- none"}

## Results

| ID | Category | Provider mode | Result | Latency ms | Repairs | Issues | Failure types |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
${rows}
`;
}
