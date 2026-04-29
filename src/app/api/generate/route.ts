import { NextResponse } from "next/server";
import { BuildRequestSchema } from "@/lib/engine/schemas";
import { startBuild } from "@/lib/engine/orchestrator";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = BuildRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request",
        issues: parsed.error.issues
      },
      { status: 400 }
    );
  }

  const result = await startBuild(parsed.data);
  return NextResponse.json(result);
}
