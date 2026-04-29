import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { startBuild } from "@/lib/engine/orchestrator";
import { BenchmarkReportSchema } from "@/lib/engine/schemas";
import type { BenchmarkReport, BuildMode } from "@/lib/engine/types";
import { evaluationPrompts } from "./dataset";

/**
 * Runs a suite of benchmarks against the engine.
 */
export async function startBenchmarks(options: { mode: BuildMode; writeArtifacts: boolean }): Promise<BenchmarkReport> {
  const results = [];

  for (const item of evaluationPrompts) {
    const build = await startBuild({ prompt: item.prompt, mode: options.mode });
    const clarificationNeeded = build.spec.executionReport.status === "clarification_needed";
    
    results.push({
      id: item.id,
      prompt: item.prompt,
      category: item.category,
      success: build.validation.valid && build.spec.executionReport.runnable,
      latencyMs: build.metrics.latencyMs,
      repairCount: build.metrics.repairCount,
      validationIssueCount: build.metrics.validationIssueCount,
      failureTypes: build.metrics.failureTypes,
      providerMode: build.metrics.providerMode,
      clarificationNeeded
    });
  }

  const total = results.length;
  const successCount = results.filter((r) => r.success).length;
  
  const failureTypes = results
    .flatMap((r) => r.failureTypes)
    .reduce<Record<string, number>>((acc, type) => {
      acc[type] = (acc[type] ?? 0) + 1;
      return acc;
    }, {});
    
  const providerModes = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.providerMode] = (acc[r.providerMode] ?? 0) + 1;
    return acc;
  }, {});

  const report: BenchmarkReport = {
    generatedAt: new Date().toISOString(),
    summary: {
      total,
      successRate: total ? successCount / total : 0,
      averageLatencyMs: Math.round(results.reduce((sum, r) => sum + r.latencyMs, 0) / Math.max(total, 1)),
      averageRepairs: results.reduce((sum, r) => sum + r.repairCount, 0) / Math.max(total, 1),
      clarificationNeeded: results.filter((r) => r.clarificationNeeded).length,
      providerModes,
      failureTypes
    },
    results
  };

  const parsed = BenchmarkReportSchema.parse(report);

  if (options.writeArtifacts) {
    await saveArtifacts(parsed);
  }

  return parsed;
}

async function saveArtifacts(report: BenchmarkReport) {
  const dir = join(process.cwd(), "artifacts", "benchmarks");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "results.json"), JSON.stringify(report, null, 2), "utf8");
  await writeFile(join(dir, "report.md"), renderMarkdown(report), "utf8");
}

function renderMarkdown(report: BenchmarkReport) {
  const rows = report.results
    .map(
      (r) =>
        `| ${r.id} | ${r.category} | ${r.providerMode} | ${r.success ? "PASS" : "FAIL"} | ${r.latencyMs} | ${r.repairCount} | ${r.failureTypes.join(", ") || "None"} |`
    )
    .join("\n");

  return `# Benchmark Report
Generated: ${report.generatedAt}

## Summary
- Total Tests: ${report.summary.total}
- Success Rate: ${Math.round(report.summary.successRate * 100)}%
- Avg Latency: ${report.summary.averageLatencyMs}ms
- Avg Repairs: ${report.summary.averageRepairs.toFixed(2)}

## Results
| ID | Category | Provider | Status | Latency | Repairs | Failures |
| --- | --- | --- | --- | ---: | ---: | --- |
${rows}
`;
}
