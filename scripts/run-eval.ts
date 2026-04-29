import { runEvaluation } from "@/lib/eval/runEvaluation";

const report = await runEvaluation({ mode: "gemini", writeArtifacts: true });

console.log(`Evaluation complete: ${Math.round(report.summary.successRate * 100)}% success`);
console.log("OpenAI is optional. The core evaluation is reliability, validation, repair, and runtime execution.");
console.log(`Average latency: ${report.summary.averageLatencyMs}ms`);
console.log(`Average repairs: ${report.summary.averageRepairs.toFixed(2)}`);
console.log("Artifacts written to artifacts/evaluation-results.json and artifacts/evaluation-report.md");
