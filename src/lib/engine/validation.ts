import { AppSpecSchema } from "./schemas";
import type { AppSpec, ValidationIssue } from "./types";

/**
 * Validates the application specification across multiple layers.
 */
export function validateSpec(spec: AppSpec) {
  const issues: ValidationIssue[] = [];
  const parsed = AppSpecSchema.safeParse(spec);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push({
        id: `schema_${issues.length + 1}`,
        stage: "schema",
        severity: "high",
        kind: "schema",
        code: "SCHEMA_INVALID",
        path: issue.path.join(".") || "$",
        message: issue.message,
        repairable: true
      });
    }
  }

  checkCrossLayer(spec, issues);
  checkLogic(spec, issues);

  return {
    valid: issues.filter((i) => ["high", "medium"].includes(i.severity)).length === 0,
    issues
  };
}

function checkCrossLayer(spec: AppSpec, issues: ValidationIssue[]) {
  const tables = new Map(spec.database.tables.map((t) => [t.name, t]));
  const roles = new Set(spec.auth.roles.map((r) => r.name));
  const endpoints = new Set(spec.api.endpoints.map((e) => e.id));
  const pages = new Set(spec.ui.pages.map((p) => p.id));

  for (const endpoint of spec.api.endpoints) {
    const table = tables.get(endpoint.entity);
    if (!table) {
      issues.push(createIssue("cross_layer", "MISSING_TABLE", `api.endpoints.${endpoint.id}`, `Endpoint references missing table ${endpoint.entity}.`));
      continue;
    }

    const columns = new Set(table.columns.map((c) => c.name));
    for (const field of [...endpoint.requestFields, ...endpoint.responseFields]) {
      if (!columns.has(field) && !["total", "count", "id"].includes(field)) {
        issues.push(createIssue("cross_layer", "FIELD_NOT_IN_TABLE", `api.endpoints.${endpoint.id}.${field}`, `Field ${field} not found in ${endpoint.entity}.`));
      }
    }

    if (!roles.has(endpoint.requiredRole)) {
      issues.push(createIssue("cross_layer", "MISSING_ROLE", `api.endpoints.${endpoint.id}.requiredRole`, `Role ${endpoint.requiredRole} is undefined.`));
    }
  }

  for (const page of spec.ui.pages) {
    for (const component of page.components) {
      if (component.actionEndpoint && !endpoints.has(component.actionEndpoint)) {
        issues.push(createIssue("cross_layer", "MISSING_ENDPOINT", `ui.pages.${page.id}.${component.id}`, `Component references unknown endpoint ${component.actionEndpoint}.`));
      }

      if (!component.entity) continue;
      const table = tables.get(component.entity);
      if (!table) {
        issues.push(createIssue("cross_layer", "MISSING_TABLE", `ui.pages.${page.id}.${component.id}`, `Component references missing table ${component.entity}.`));
        continue;
      }
    }
  }

  for (const rule of spec.businessRules) {
    for (const point of rule.enforcementPoints) {
      if (!endpoints.has(point) && !pages.has(point)) {
        // Log warning for missing enforcement point
      }
    }
  }
}

function checkLogic(spec: AppSpec, issues: ValidationIssue[]) {
  const hasBilling = spec.ui.pages.some((p) => p.layout === "checkout");
  const tableNames = new Set(spec.database.tables.map((t) => t.name));

  if (hasBilling && (!tableNames.has("payments") || !tableNames.has("subscriptions"))) {
    issues.push(createIssue("logical", "PREMIUM_WITHOUT_BILLING_DATA", "database", "Billing flow requires payments and subscriptions tables."));
  }

  if (spec.ui.pages.length === 0 || spec.api.endpoints.length === 0) {
    issues.push(createIssue("logical", "EMPTY_SPEC", "executionReport", "Specification is missing core components."));
  }
}

function createIssue(kind: ValidationIssue["kind"], code: string, path: string, message: string): ValidationIssue {
  return {
    id: `${code.toLowerCase()}_${path.replace(/[^a-z0-9]+/gi, "_")}`,
    stage: kind,
    severity: "medium",
    kind,
    code,
    path,
    message,
    repairable: true
  };
}
