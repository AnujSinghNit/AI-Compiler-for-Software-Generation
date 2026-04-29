import { NextResponse } from "next/server";
import { startBenchmarks } from "@/lib/benchmarks/orchestrator";

export async function POST() {
  const report = await startBenchmarks({ mode: "fallback", writeArtifacts: false });
  return NextResponse.json(report);
}
