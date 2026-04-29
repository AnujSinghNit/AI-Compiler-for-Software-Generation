import type { z } from "zod";
import type {
  AppSpecSchema,
  BusinessRuleSchema,
  DatabaseColumnSchema,
  DatabaseTableSchema,
  BenchmarkReportSchema,
  BenchmarkResultSchema,
  BuildRequestSchema,
  BuildResultSchema,
  UserIntentSchema,
  RepairActionSchema,
  ArchitectureSchema,
  ValidationIssueSchema
} from "./schemas";

export type BuildMode = "auto" | "openai" | "gemini" | "fallback";
export type BuildRequest = z.infer<typeof BuildRequestSchema>;
export type UserIntent = z.infer<typeof UserIntentSchema>;
export type Architecture = z.infer<typeof ArchitectureSchema>;
export type AppSpec = z.infer<typeof AppSpecSchema>;
export type DatabaseTable = z.infer<typeof DatabaseTableSchema>;
export type DatabaseColumn = z.infer<typeof DatabaseColumnSchema>;
export type BusinessRule = z.infer<typeof BusinessRuleSchema>;
export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;
export type RepairAction = z.infer<typeof RepairActionSchema>;
export type BuildResult = z.infer<typeof BuildResultSchema>;
export type BenchmarkResult = z.infer<typeof BenchmarkResultSchema>;
export type BenchmarkReport = z.infer<typeof BenchmarkReportSchema>;

export type ProviderMode = "openai" | "gemini" | "fallback";

export type StageResult = BuildResult["stages"][number];
