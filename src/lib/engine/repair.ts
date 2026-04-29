import type { AppSpec, RepairAction, ValidationIssue } from "./types";
import { createTable, pluralize, slugify, stableId, titleize } from "./utils";

/**
 * Automatically fixes common validation issues in the application spec.
 */
export function repairSpec(spec: AppSpec, issues: ValidationIssue[], pass: number) {
  const repaired: AppSpec = structuredClone(spec);
  const repairs: RepairAction[] = [];

  for (const issue of issues) {
    if (!issue.repairable) continue;

    if (issue.code === "MISSING_TABLE") {
      const tableName = extractName(issue.message);
      if (tableName && !repaired.database.tables.some((t) => t.name === tableName)) {
        repaired.database.tables.push(createTable(tableName));
        repairs.push(createRepair(issue, "add_missing_table", `Added table ${tableName}.`, pass));
      }
    }

    if (issue.code === "FIELD_NOT_IN_TABLE") {
      const field = extractField(issue.message);
      const tableName = extractTable(issue.message);
      const table = repaired.database.tables.find((t) => t.name === tableName);
      if (field && table && !table.columns.some((c) => c.name === field)) {
        table.columns.push({ name: field, type: inferType(field), required: false, unique: false });
        repairs.push(createRepair(issue, "add_missing_column", `Added ${field} to ${table.name}.`, pass));
      }
    }

    if (issue.code === "MISSING_ROLE") {
      const role = extractName(issue.message);
      if (role && !repaired.auth.roles.some((r) => r.name === role)) {
        repaired.auth.roles.push({
          name: slugify(role),
          description: `${titleize(role)} access role.`,
          planAccess: role === "admin" ? "internal" : "free",
          permissions: repaired.database.tables.map((t) => ({
            resource: t.name,
            actions: role === "admin" ? ["read", "create", "update", "delete", "manage"] : ["read"]
          }))
        });
        repairs.push(createRepair(issue, "add_missing_role", `Added role ${role}.`, pass));
      }
    }

    if (issue.code === "MISSING_ENDPOINT") {
      const endpointId = extractName(issue.message);
      const component = repaired.ui.pages.flatMap((p) => p.components).find((c) => c.actionEndpoint === endpointId);
      const entity = component?.entity ? pluralize(slugify(component.entity)) : "records";
      if (endpointId && !repaired.api.endpoints.some((e) => e.id === endpointId)) {
        repaired.api.endpoints.push({
          id: endpointId,
          path: `/api/v1/${entity}`,
          method: "GET",
          entity,
          operation: "list",
          requestFields: [],
          responseFields: ["id", "name", "status"],
          requiredRole: "user",
          validation: []
        });
        repairs.push(createRepair(issue, "add_endpoint", `Added endpoint ${endpointId}.`, pass));
      }
    }

    if (issue.code === "PREMIUM_WITHOUT_BILLING_DATA") {
      ["subscriptions", "payments"].forEach((name) => {
        if (!repaired.database.tables.some((t) => t.name === name)) {
          repaired.database.tables.push(createTable(name));
        }
      });
      repairs.push(createRepair(issue, "add_missing_table", "Added billing support.", pass));
    }
  }

  repaired.executionReport = {
    status: "ready",
    runnable: true,
    pagesCompiled: repaired.ui.pages.length,
    endpointsCompiled: repaired.api.endpoints.length,
    tablesCompiled: repaired.database.tables.length,
    notes: [`Repair pass ${pass} complete.`]
  };

  return { spec: repaired, repairs };
}

function createRepair(issue: ValidationIssue, action: RepairAction["action"], description: string, pass: number): RepairAction {
  return {
    id: `fix_${pass}_${issue.id}`,
    issueId: issue.id,
    action,
    stage: "repair",
    description
  };
}

function extractName(message: string) {
  const match = message.match(/([a-zA-Z0-9_]+)\.?$/);
  return match?.[1] ? slugify(match[1]) : "";
}

function extractField(message: string) {
  const match = message.match(/field ([a-zA-Z0-9_]+)/i);
  return match?.[1] ? slugify(match[1]) : "";
}

function extractTable(message: string) {
  const match = message.match(/but ([a-zA-Z0-9_]+) does not define/i);
  return match?.[1] ? pluralize(slugify(match[1])) : "";
}

function inferType(field: string) {
  if (field.includes("email")) return "email" as const;
  if (field.includes("password")) return "password" as const;
  if (field.includes("amount") || field.includes("price")) return "money" as const;
  if (field.includes("count") || field.includes("total")) return "number" as const;
  if (field.startsWith("is_") || field.includes("active")) return "boolean" as const;
  if (field.endsWith("_at") || field.includes("date")) return "date" as const;
  return "string" as const;
}
