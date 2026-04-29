import type { UserIntent, Architecture } from "./types";
import { singularize, titleize, unique } from "./utils";

/**
 * Creates a system architecture based on user intent.
 */
export function createArchitecture(intent: UserIntent): Architecture {
  const roles = unique(["admin", ...intent.actors]).map((actor) => ({
    name: actor,
    responsibilities:
      actor === "admin"
        ? ["Workspace settings", "Analytics", "User management"]
        : [`${titleize(intent.domain)} workflows`, "Record management"]
  }));

  const entities = unique(["users", ...intent.entities, ...getDerivedEntities(intent)]).map((entity) => ({
    name: entity,
    description: `Core data model for ${titleize(entity)}.`,
    fields: getEntityFields(entity, intent.features),
    relationships: entity === "users" ? [] : ["belongs_to users"]
  }));

  const flows = [
    {
      name: "Dashboard Landing",
      actor: intent.actors.includes("admin") ? "admin" : "user",
      steps: ["Authentication", "Role check", "Load dashboard"]
    },
    {
      name: "Record Lifecycle",
      actor: "user",
      steps: ["Navigate to resource", "Input data", "Validation", "Save"]
    }
  ];

  if (intent.features.includes("payments") || intent.features.includes("premium gating")) {
    flows.push({
      name: "Subscription Upgrade",
      actor: "user",
      steps: ["Open billing", "Payment gateway", "Verification", "Unlock features"]
    });
  }

  if (intent.features.includes("analytics")) {
    flows.push({
      name: "Insights Review",
      actor: "admin",
      steps: ["Open reports", "Data aggregation", "Visualization"]
    });
  }

  return {
    appName: `${titleize(intent.domain)} System`,
    architecture: {
      style: "Modular Config-Driven",
      runtime: "Next.js + Custom Engine",
      dataLayer: "Relational Mock"
    },
    entities,
    roles,
    flows,
    assumptions: intent.assumptions
  };
}

function getDerivedEntities(intent: UserIntent) {
  const entities: string[] = [];
  if (intent.features.includes("payments")) entities.push("payments");
  if (intent.features.includes("premium gating")) entities.push("subscriptions");
  if (intent.features.includes("analytics")) entities.push("analytics_events");
  return entities;
}

function getEntityFields(entity: string, features: string[]) {
  const singular = singularize(entity);
  
  const base = {
    users: [
      { name: "email", type: "email" as const, required: true, label: "Email", options: [] },
      { name: "name", type: "string" as const, required: true, label: "Name", options: [] },
      { name: "role", type: "select" as const, required: true, label: "Role", options: ["admin", "user", "manager", "customer"] },
      { name: "plan", type: "select" as const, required: true, label: "Plan", options: ["free", "premium"] }
    ],
    payments: [
      { name: "amount", type: "money" as const, required: true, label: "Amount", options: [] },
      { name: "status", type: "select" as const, required: true, label: "Status", options: ["pending", "paid", "failed"] },
      { name: "provider", type: "string" as const, required: true, label: "Provider", options: [] }
    ],
    subscriptions: [
      { name: "plan", type: "select" as const, required: true, label: "Plan", options: ["free", "premium"] },
      { name: "active", type: "boolean" as const, required: true, label: "Active", options: [] },
      { name: "renews_at", type: "date" as const, required: false, label: "Renews At", options: [] }
    ],
    analytics_events: [
      { name: "event_name", type: "string" as const, required: true, label: "Event", options: [] },
      { name: "count", type: "number" as const, required: true, label: "Count", options: [] },
      { name: "period", type: "string" as const, required: true, label: "Period", options: [] }
    ]
  };

  if (entity in base) {
    return base[entity as keyof typeof base];
  }

  return [
    { name: "name", type: "string" as const, required: true, label: titleize(`${singular} name`), options: [] },
    { name: "status", type: "select" as const, required: true, label: "Status", options: ["new", "active", "archived"] },
    { name: "owner_id", type: "string" as const, required: false, label: "Owner", options: [] },
    {
      name: features.includes("analytics") ? "score" : "notes",
      type: features.includes("analytics") ? ("number" as const) : ("text" as const),
      required: false,
      label: features.includes("analytics") ? "Score" : "Notes",
      options: []
    }
  ];
}
