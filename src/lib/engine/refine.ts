import type { AppSpec } from "./types";
import { createTable, pluralize, slugify, stableId, titleize } from "./utils";

/**
 * Aligns and normalizes the application specification.
 */
export function refineSpec(spec: AppSpec): AppSpec {
  const refined: AppSpec = structuredClone(spec);
  
  syncAuth(refined);
  syncBilling(refined);
  syncAnalytics(refined);
  normalizeIds(refined);
  alignNavigation(refined);
  updateStatus(refined);
  
  return refined;
}

function normalizeIds(spec: AppSpec) {
  const seen = new Set<string>();
  for (const page of spec.ui.pages) {
    const base = page.id || stableId("page", page.title);
    let id = base;
    let i = 2;
    while (seen.has(id)) {
      id = `${base}_${i++}`;
    }
    page.id = id;
    seen.add(id);
  }
}

function syncAuth(spec: AppSpec) {
  if (!spec.api.endpoints.some((e) => e.id === "auth_login")) {
    spec.api.endpoints.push({
      id: "auth_login",
      path: "/api/v1/auth/login",
      method: "POST",
      entity: "users",
      operation: "login",
      requestFields: ["email", "password"],
      responseFields: ["id", "email", "role"],
      requiredRole: "user",
      validation: []
    });
  }

  const users = spec.database.tables.find((t) => t.name === "users");
  if (users && !users.columns.some((c) => c.name === "password")) {
    users.columns.push({ name: "password", type: "password", required: true, unique: false });
  }
}

function syncBilling(spec: AppSpec) {
  const hasBilling = spec.ui.pages.some((p) => p.layout === "checkout");
  if (!hasBilling) return;

  ["payments", "subscriptions"].forEach((name) => {
    if (!spec.database.tables.some((t) => t.name === name)) {
      spec.database.tables.push(createTable(name));
    }
  });

  if (!spec.api.endpoints.some((e) => e.id === "payments_checkout")) {
    spec.api.endpoints.push({
      id: "payments_checkout",
      path: "/api/v1/payments/checkout",
      method: "POST",
      entity: "payments",
      operation: "checkout",
      requestFields: ["amount", "provider"],
      responseFields: ["id", "status"],
      requiredRole: "user",
      validation: []
    });
  }
}

function syncAnalytics(spec: AppSpec) {
  const hasAnalytics = spec.ui.pages.some((p) => p.id === "analytics");
  if (!hasAnalytics) return;

  if (!spec.database.tables.some((t) => t.name === "analytics_events")) {
    spec.database.tables.push(createTable("analytics_events"));
  }
}

function alignNavigation(spec: AppSpec) {
  spec.ui.navigation = spec.ui.pages.map((p) => ({ label: p.title, path: p.path }));

  spec.ui.pages.forEach((page) => {
    page.components.forEach((c) => {
      if (c.entity) c.entity = pluralize(slugify(c.entity));
      if (!c.actionEndpoint && c.entity) {
        c.actionEndpoint = stableId("api", `${c.entity}_list`);
      }
    });
  });

  spec.api.endpoints.forEach((e) => {
    e.entity = pluralize(slugify(e.entity));
  });

  spec.database.tables.forEach((t) => {
    t.name = pluralize(slugify(t.name));
  });
}

function updateStatus(spec: AppSpec) {
  spec.executionReport = {
    status: "ready",
    runnable: true,
    pagesCompiled: spec.ui.pages.length,
    endpointsCompiled: spec.api.endpoints.length,
    tablesCompiled: spec.database.tables.length,
    notes: ["Configuration validated and ready for runtime."]
  };
}
