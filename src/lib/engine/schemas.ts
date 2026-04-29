import { z } from "zod";

export const ModeSchema = z.enum(["auto", "openai", "gemini", "fallback"]).default("auto");

export const EntityFieldSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["string", "text", "email", "password", "number", "boolean", "date", "money", "select"]),
  required: z.boolean(),
  label: z.string().min(1),
  options: z.array(z.string()).default([])
});

export const UserIntentSchema = z.object({
  prompt: z.string().min(3),
  normalizedGoal: z.string().min(3),
  domain: z.string().min(2),
  features: z.array(z.string()).min(1),
  actors: z.array(z.string()).min(1),
  entities: z.array(z.string()).min(1),
  requestedIntegrations: z.array(z.string()).default([]),
  ambiguity: z.array(z.string()).default([]),
  conflicts: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([])
});

export const DesignEntitySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  fields: z.array(EntityFieldSchema).min(1),
  relationships: z.array(z.string()).default([])
});

export const DesignRoleSchema = z.object({
  name: z.string().min(1),
  responsibilities: z.array(z.string()).min(1)
});

export const DesignFlowSchema = z.object({
  name: z.string().min(1),
  actor: z.string().min(1),
  steps: z.array(z.string()).min(1)
});

export const ArchitectureSchema = z.object({
  appName: z.string().min(2),
  architecture: z.object({
    style: z.string().min(1),
    runtime: z.string().min(1),
    dataLayer: z.string().min(1)
  }),
  entities: z.array(DesignEntitySchema).min(1),
  roles: z.array(DesignRoleSchema).min(1),
  flows: z.array(DesignFlowSchema).min(1),
  assumptions: z.array(z.string()).default([])
});

export const DatabaseColumnSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["uuid", "string", "text", "email", "password", "number", "boolean", "date", "money", "json"]),
  required: z.boolean(),
  unique: z.boolean().default(false),
  references: z.string().optional()
});

export const DatabaseTableSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  columns: z.array(DatabaseColumnSchema).min(1)
});

export const ApiEndpointSchema = z.object({
  id: z.string().min(1),
  path: z.string().startsWith("/"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  entity: z.string().min(1),
  operation: z.enum(["list", "create", "read", "update", "delete", "aggregate", "checkout", "login"]),
  requestFields: z.array(z.string()).default([]),
  responseFields: z.array(z.string()).default([]),
  requiredRole: z.string().min(1),
  validation: z
    .array(
      z.object({
        field: z.string().min(1),
        rule: z.string().min(1),
        message: z.string().min(1)
      })
    )
    .default([])
});

export const UiComponentSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["nav", "metric", "chart", "table", "form", "list", "button", "text"]),
  title: z.string().min(1),
  entity: z.string().optional(),
  fields: z.array(z.string()).default([]),
  actionEndpoint: z.string().optional()
});

export const UiPageSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  path: z.string().startsWith("/"),
  layout: z.enum(["dashboard", "resource", "auth", "settings", "checkout"]),
  requiredRoles: z.array(z.string()).default([]),
  components: z.array(UiComponentSchema).min(1)
});

export const AuthRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  permissions: z.array(
    z.object({
      resource: z.string().min(1),
      actions: z.array(z.enum(["read", "create", "update", "delete", "manage", "aggregate", "checkout"])).min(1)
    })
  ),
  planAccess: z.enum(["free", "premium", "internal"]).default("free")
});

export const BusinessRuleSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  trigger: z.string().min(1),
  effect: z.string().min(1),
  relatedEntities: z.array(z.string()).default([]),
  enforcementPoints: z.array(z.string()).default([])
});

export const ExecutionReportSchema = z.object({
  status: z.enum(["ready", "clarification_needed", "failed"]),
  runnable: z.boolean(),
  pagesCompiled: z.number().int().nonnegative(),
  endpointsCompiled: z.number().int().nonnegative(),
  tablesCompiled: z.number().int().nonnegative(),
  notes: z.array(z.string()).default([])
});

export const AppSpecSchema = z.object({
  appName: z.string().min(2),
  summary: z.string().min(3),
  ui: z.object({
    pages: z.array(UiPageSchema).min(1),
    navigation: z.array(
      z.object({
        label: z.string().min(1),
        path: z.string().startsWith("/")
      })
    )
  }),
  api: z.object({
    basePath: z.string().startsWith("/"),
    endpoints: z.array(ApiEndpointSchema).min(1)
  }),
  database: z.object({
    tables: z.array(DatabaseTableSchema).min(1)
  }),
  auth: z.object({
    loginRequired: z.boolean(),
    providers: z.array(z.enum(["email", "oauth", "magic_link"])).min(1),
    roles: z.array(AuthRoleSchema).min(1)
  }),
  businessRules: z.array(BusinessRuleSchema).default([]),
  assumptions: z.array(z.string()).default([]),
  executionReport: ExecutionReportSchema
});

export const ValidationIssueSchema = z.object({
  id: z.string().min(1),
  stage: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]),
  kind: z.enum(["schema", "cross_layer", "logical", "ambiguity"]),
  code: z.string().min(1),
  path: z.string().min(1),
  message: z.string().min(1),
  repairable: z.boolean()
});

export const RepairActionSchema = z.object({
  id: z.string().min(1),
  issueId: z.string().min(1),
  action: z.enum(["add_missing_table", "add_missing_column", "add_missing_role", "add_endpoint", "align_field", "document_assumption", "regenerate_stage"]),
  stage: z.string().min(1),
  description: z.string().min(1),
  before: z.string().optional(),
  after: z.string().optional()
});

export const StageResultSchema = z.object({
  name: z.string().min(1),
  status: z.enum(["idle", "ok", "repaired", "failed"]),
  startedAt: z.string().min(1),
  endedAt: z.string().min(1),
  summary: z.string().min(1)
});

export const BuildResultSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  providerMode: z.enum(["openai", "gemini", "fallback"]),
  stages: z.array(StageResultSchema).min(1),
  intent: UserIntentSchema,
  design: ArchitectureSchema,
  spec: AppSpecSchema,
  validation: z.object({
    valid: z.boolean(),
    issues: z.array(ValidationIssueSchema)
  }),
  repairs: z.array(RepairActionSchema),
  metrics: z.object({
    latencyMs: z.number().int().nonnegative(),
    validationIssueCount: z.number().int().nonnegative(),
    repairCount: z.number().int().nonnegative(),
    retries: z.number().int().nonnegative(),
    providerMode: z.enum(["openai", "gemini", "fallback"]),
    estimatedCostUsd: z.number().nonnegative(),
    failureTypes: z.array(z.string())
  })
});

export const BuildRequestSchema = z.object({
  prompt: z.string().min(3),
  mode: ModeSchema,
  previousSpec: AppSpecSchema.optional().nullable(),
  changeRequest: z.string().optional().nullable()
});

export const BenchmarkResultSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  category: z.enum(["product", "edge"]),
  success: z.boolean(),
  latencyMs: z.number().int().nonnegative(),
  repairCount: z.number().int().nonnegative(),
  validationIssueCount: z.number().int().nonnegative(),
  failureTypes: z.array(z.string()),
  providerMode: z.enum(["openai", "gemini", "fallback"]),
  clarificationNeeded: z.boolean()
});

export const BenchmarkReportSchema = z.object({
  generatedAt: z.string().min(1),
  summary: z.object({
    total: z.number().int().nonnegative(),
    successRate: z.number().min(0).max(1),
    averageLatencyMs: z.number().int().nonnegative(),
    averageRepairs: z.number().nonnegative(),
    clarificationNeeded: z.number().int().nonnegative(),
    providerModes: z.record(z.string(), z.number().int().nonnegative()),
    failureTypes: z.record(z.string(), z.number().int().nonnegative())
  }),
  results: z.array(BenchmarkResultSchema)
});
