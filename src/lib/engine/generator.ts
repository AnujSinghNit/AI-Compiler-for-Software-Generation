import type { AppSpec, BusinessRule, DatabaseColumn, DatabaseTable, Architecture } from "./types";
import { fieldTypeToDb, pluralize, singularize, slugify, stableId, titleize, unique } from "./utils";

/**
 * Generates a complete application specification from an architecture design.
 */
export function generateAppSpec(design: Architecture): AppSpec {
  const tables = design.entities.map((entity) => createTable(entity));
  const roles = design.roles.map((role) => createRole(role.name, design.entities.map((e) => e.name)));
  const endpoints = design.entities.flatMap((entity) => createEndpoints(entity.name));
  
  const pages = [
    createDashboard(design),
    ...design.entities
      .filter((e) => !["users", "analytics", "analytics_events"].includes(e.name))
      .slice(0, 6)
      .map((e) => createResourcePage(e.name)),
    ...createExtraPages(design)
  ];

  return {
    appName: design.appName,
    summary: `Build configuration for ${design.appName}.`,
    ui: {
      pages,
      navigation: pages.map((p) => ({ label: p.title, path: p.path }))
    },
    api: {
      basePath: "/api/v1",
      endpoints
    },
    database: {
      tables
    },
    auth: {
      loginRequired: true,
      providers: ["email"],
      roles
    },
    businessRules: createBusinessRules(design),
    assumptions: design.assumptions,
    executionReport: {
      status: "ready",
      runnable: true,
      pagesCompiled: pages.length,
      endpointsCompiled: endpoints.length,
      tablesCompiled: tables.length,
      notes: ["Initial build configuration ready."]
    }
  };
}

function createTable(entity: Architecture["entities"][number]): DatabaseTable {
  const columns: DatabaseColumn[] = [
    { name: "id", type: "uuid", required: true, unique: true },
    ...entity.fields.map((f) => ({
      name: slugify(f.name),
      type: fieldTypeToDb(f.type),
      required: f.required,
      unique: f.name === "email",
      references: f.name.endsWith("_id") ? "users.id" : undefined
    })),
    { name: "created_at", type: "date", required: true, unique: false },
    { name: "updated_at", type: "date", required: true, unique: false }
  ];

  return {
    name: pluralize(slugify(entity.name)),
    description: entity.description,
    columns: uniqueByName(columns)
  };
}

function createEndpoints(entity: string) {
  const resource = pluralize(slugify(entity));
  const singular = singularize(resource);
  const path = `/api/v1/${resource}`;
  
  return [
    {
      id: stableId("api", `${resource}_list`),
      path,
      method: "GET" as const,
      entity: resource,
      operation: "list" as const,
      requestFields: [],
      responseFields: ["id", "name", "status"],
      requiredRole: "user",
      validation: []
    },
    {
      id: stableId("api", `${resource}_create`),
      path,
      method: "POST" as const,
      entity: resource,
      operation: "create" as const,
      requestFields: resource === "users" ? ["email", "name", "role"] : ["name", "status"],
      responseFields: ["id", "name", "status"],
      requiredRole: "user",
      validation: [
        {
          field: resource === "users" ? "email" : "name",
          rule: "required",
          message: `${titleize(singular)} label is required.`
        }
      ]
    }
  ];
}

function createDashboard(design: Architecture): AppSpec["ui"]["pages"][number] {
  const primary = design.entities.filter((e) => e.name !== "users").slice(0, 3);
  return {
    id: "dashboard",
    title: "Dashboard",
    path: "/dashboard",
    layout: "dashboard",
    requiredRoles: ["user", "admin"],
    components: [
      {
        id: "metrics_overview",
        type: "metric",
        title: "Overview",
        fields: ["total", "active", "pending"]
      },
      ...primary.map((e) => ({
        id: stableId("ui", `${e.name}_list`),
        type: "table" as const,
        title: `Recent ${titleize(e.name)}`,
        entity: e.name,
        fields: getUiFields(e.name),
        actionEndpoint: stableId("api", `${e.name}_list`)
      }))
    ]
  };
}

function createResourcePage(entity: string): AppSpec["ui"]["pages"][number] {
  const resource = pluralize(slugify(entity));
  return {
    id: stableId("page", resource),
    title: titleize(resource),
    path: `/${resource}`,
    layout: "resource",
    requiredRoles: ["user", "admin"],
    components: [
      {
        id: stableId("ui", `${resource}_form`),
        type: "form",
        title: `New ${titleize(singularize(resource))}`,
        entity: resource,
        fields: getUiFields(resource),
        actionEndpoint: stableId("api", `${resource}_create`)
      },
      {
        id: stableId("ui", `${resource}_table`),
        type: "table",
        title: titleize(resource),
        entity: resource,
        fields: ["id", ...getUiFields(resource)],
        actionEndpoint: stableId("api", `${resource}_list`)
      }
    ]
  };
}

function createExtraPages(design: Architecture): AppSpec["ui"]["pages"] {
  const pages: AppSpec["ui"]["pages"] = [
    {
      id: "login",
      title: "Login",
      path: "/login",
      layout: "auth",
      requiredRoles: [],
      components: [
        {
          id: "login_form",
          type: "form",
          title: "Sign In",
          entity: "users",
          fields: ["email", "password"],
          actionEndpoint: "auth_login"
        }
      ]
    }
  ];

  if (design.entities.some((e) => ["subscriptions", "payments"].includes(e.name))) {
    pages.push({
      id: "billing",
      title: "Billing",
      path: "/billing",
      layout: "checkout",
      requiredRoles: ["user", "admin"],
      components: [
        {
          id: "checkout_form",
          type: "form",
          title: "Subscription",
          entity: "payments",
          fields: ["amount", "status"],
          actionEndpoint: "payments_checkout"
        }
      ]
    });
  }

  return pages;
}

function createRole(name: string, entities: string[]): AppSpec["auth"]["roles"][number] {
  const actions = name === "admin" ? ["read", "create", "update", "delete", "manage"] : ["read", "create", "update"];
  return {
    name,
    description: `Permissions for ${name} role.`,
    planAccess: name === "admin" ? "internal" : "free",
    permissions: entities.map((e) => ({
      resource: pluralize(slugify(e)),
      actions: actions as any
    }))
  };
}

function createBusinessRules(design: Architecture): BusinessRule[] {
  const rules: BusinessRule[] = [
    {
      id: "access_control",
      description: "Enforce role-based access to all resources.",
      trigger: "API Request",
      effect: "Validate permissions against user role.",
      relatedEntities: design.entities.map((e) => e.name),
      enforcementPoints: ["auth_middleware"]
    }
  ];

  if (design.entities.some((e) => e.name === "subscriptions")) {
    rules.push({
      id: "premium_access",
      description: "Restricted features require active subscription.",
      trigger: "Feature access",
      effect: "Block non-premium users from protected areas.",
      relatedEntities: ["subscriptions", "payments"],
      enforcementPoints: ["billing_page"]
    });
  }

  return rules;
}

function getUiFields(entity: string) {
  const res = pluralize(slugify(entity));
  const mapping: Record<string, string[]> = {
    users: ["email", "name", "role"],
    payments: ["amount", "status"],
    subscriptions: ["plan", "active"],
    analytics_events: ["event_name", "count"]
  };
  return mapping[res] ?? ["name", "status"];
}

function uniqueByName(columns: DatabaseColumn[]) {
  const seen = new Set<string>();
  return columns.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });
}
