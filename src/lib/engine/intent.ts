import type { GenerateRequest, UserIntent } from "./types";
import { pluralize, slugify, unique } from "./utils";

/**
 * Heuristics for detecting the application domain based on keywords.
 */
const DOMAIN_DATA = [
  {
    domain: "crm",
    terms: ["crm", "contact", "lead", "deal", "sales", "pipeline"],
    entities: ["contacts", "deals", "accounts", "activities"],
    features: ["contact management", "pipeline dashboard"]
  },
  {
    domain: "marketplace",
    terms: ["marketplace", "seller", "buyer", "product", "order", "store"],
    entities: ["products", "orders", "customers", "sellers"],
    features: ["catalog", "order management"]
  },
  {
    domain: "booking",
    terms: ["booking", "appointment", "calendar", "reservation", "schedule"],
    entities: ["appointments", "services", "customers", "staff"],
    features: ["calendar scheduling", "availability"]
  },
  {
    domain: "learning",
    terms: ["course", "lesson", "student", "learning", "lms"],
    entities: ["courses", "lessons", "students", "enrollments"],
    features: ["course management", "progress tracking"]
  },
  {
    domain: "project_management",
    terms: ["project", "task", "kanban", "sprint", "ticket"],
    entities: ["projects", "tasks", "comments", "members"],
    features: ["task tracking", "team dashboard"]
  }
];

/**
 * Extracts intent and basic entities from a natural language prompt.
 */
export function extractIntent(request: GenerateRequest): UserIntent {
  const rawPrompt = `${request.prompt} ${request.changeRequest ?? ""}`.trim();
  const prompt = rawPrompt.replace(/\s+/g, " ");
  const lower = prompt.toLowerCase();
  const detected = DOMAIN_DATA.find((item) => item.terms.some((term) => lower.includes(term)));
  const domain = detected?.domain ?? "operations";

  const features = unique([
    ...(detected?.features ?? ["record management", "operations dashboard"]),
    ...getFeatures(lower)
  ]);
  const actors = unique(getActors(lower));
  const entities = unique([...(detected?.entities ?? inferEntities(lower)), ...getEntityHints(lower)])
    .map(slugify)
    .map(pluralize);
    
  const requestedIntegrations = getIntegrations(lower);
  const conflicts = getConflicts(lower);
  const ambiguity = getAmbiguities(prompt, entities, conflicts);
  
  const assumptions = [
    "Run on an in-memory runtime for initial demonstration.",
    "Default to email-based authentication."
  ];

  if (!lower.includes("database") && !lower.includes("schema")) {
    assumptions.push("Infer schema from product context and workflows.");
  }

  if (request.previousSpec && request.changeRequest) {
    assumptions.push("Apply incremental changes to the existing specification.");
  }

  return {
    prompt: request.prompt,
    normalizedGoal: `Build a ${domain.replace(/_/g, " ")} app with ${features.slice(0, 4).join(", ")}.`,
    domain,
    features,
    actors,
    entities: entities.length ? entities : ["records", "users"],
    requestedIntegrations,
    ambiguity,
    conflicts,
    assumptions
  };
}

function getFeatures(lower: string) {
  const list: string[] = [];
  if (lower.includes("login") || lower.includes("auth")) list.push("authentication");
  if (lower.includes("role") || lower.includes("admin")) list.push("role-based access");
  if (lower.includes("dashboard")) list.push("dashboard");
  if (lower.includes("analytic") || lower.includes("report")) list.push("analytics");
  if (lower.includes("premium") || lower.includes("plan")) list.push("premium gating");
  if (lower.includes("payment") || lower.includes("stripe") || lower.includes("checkout")) list.push("payments");
  if (lower.includes("notification") || lower.includes("email")) list.push("notifications");
  if (lower.includes("search") || lower.includes("filter")) list.push("search and filtering");
  if (lower.includes("import") || lower.includes("csv")) list.push("data import");
  return list;
}

function getActors(lower: string) {
  const actors = ["user"];
  const roles = ["admin", "manager", "seller", "buyer", "customer", "staff", "student", "instructor", "teacher"];
  roles.forEach(role => {
    if (lower.includes(role)) actors.push(role);
  });
  return actors;
}

function getEntityHints(lower: string) {
  const hints = [
    "contacts", "leads", "deals", "accounts", "products", "orders", 
    "payments", "subscriptions", "invoices", "appointments", 
    "tasks", "projects", "tickets", "courses", "lessons", "students"
  ];
  return hints.filter((hint) => lower.includes(hint) || lower.includes(hint.slice(0, -1)));
}

function inferEntities(lower: string) {
  if (lower.includes("dashboard")) return ["records", "reports"];
  return ["records"];
}

function getIntegrations(lower: string) {
  const items: string[] = [];
  if (lower.includes("stripe") || lower.includes("payment")) items.push("payments");
  if (lower.includes("email")) items.push("email");
  if (lower.includes("slack")) items.push("slack");
  if (lower.includes("calendar")) items.push("calendar");
  return unique(items);
}

function getConflicts(lower: string) {
  const list: string[] = [];
  if ((lower.includes("no login") || lower.includes("without login")) && (lower.includes("login") || lower.includes("auth"))) {
    list.push("Conflicting requests regarding authentication.");
  }
  if (lower.includes("admins can see analytics") && lower.includes("admins cannot see analytics")) {
    list.push("Contradictory admin access rules.");
  }
  if ((lower.includes("free only") || lower.includes("no paid")) && (lower.includes("premium") || lower.includes("payment"))) {
    list.push("Conflict between free-only requirement and premium features.");
  }
  return list;
}

function getAmbiguities(prompt: string, entities: string[], conflicts: string[]) {
  const list: string[] = [];
  if (prompt.trim().split(/\s+/).length < 7) {
    list.push("Prompt is too brief to define a clear workflow.");
  }
  if (entities.length <= 1 && !prompt.toLowerCase().includes("manage")) {
    list.push("The underlying data model is underspecified.");
  }
  if (conflicts.length > 0) {
    list.push("Potential requirement conflicts detected.");
  }
  return list;
}
