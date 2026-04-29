export const evaluationPrompts = [
  {
    id: "product_crm",
    category: "product" as const,
    prompt:
      "Build a CRM with login, contacts, deals, dashboard, role-based access, premium plan with payments, and admin analytics."
  },
  {
    id: "product_marketplace",
    category: "product" as const,
    prompt:
      "Create a marketplace for sellers and buyers with product listings, orders, checkout payments, customer accounts, and admin reporting."
  },
  {
    id: "product_booking",
    category: "product" as const,
    prompt:
      "Build a booking app for appointments with staff availability, customers, calendar dashboard, email notifications, and manager access."
  },
  {
    id: "product_lms",
    category: "product" as const,
    prompt:
      "Generate an LMS with courses, lessons, students, enrollments, instructor dashboards, progress analytics, and paid premium courses."
  },
  {
    id: "product_project",
    category: "product" as const,
    prompt:
      "Build a project management tool with projects, tasks, comments, members, kanban dashboard, roles, and analytics for admins."
  },
  {
    id: "product_support",
    category: "product" as const,
    prompt:
      "Create a support ticket system with customers, tickets, agents, SLA dashboard, admin analytics, and searchable ticket history."
  },
  {
    id: "product_inventory",
    category: "product" as const,
    prompt:
      "Build inventory software with products, suppliers, purchase orders, stock movements, low stock dashboard, and manager approvals."
  },
  {
    id: "product_finance",
    category: "product" as const,
    prompt:
      "Create a finance tracker with accounts, transactions, budgets, dashboards, subscription plan, payments, and user roles."
  },
  {
    id: "product_events",
    category: "product" as const,
    prompt:
      "Build an event management app with events, tickets, attendees, checkout payments, organizer dashboard, and admin reporting."
  },
  {
    id: "product_hr",
    category: "product" as const,
    prompt:
      "Generate an HR portal with employees, leave requests, approvals, manager dashboard, role permissions, and audit analytics."
  },
  {
    id: "edge_vague",
    category: "edge" as const,
    prompt: "Build something useful."
  },
  {
    id: "edge_conflict_auth",
    category: "edge" as const,
    prompt: "Build a dashboard with login and role access, but no login and no auth should exist."
  },
  {
    id: "edge_conflict_premium",
    category: "edge" as const,
    prompt: "Create a free only CRM with no paid features, premium subscriptions, and payment checkout."
  },
  {
    id: "edge_admin_conflict",
    category: "edge" as const,
    prompt: "Build analytics where admins can see analytics and admins cannot see analytics."
  },
  {
    id: "edge_missing_roles",
    category: "edge" as const,
    prompt: "Build a contacts app where regional reviewers approve records, with no other role details."
  },
  {
    id: "edge_many_features",
    category: "edge" as const,
    prompt:
      "Build CRM, marketplace, booking, payments, analytics, messaging, imports, exports, dashboards, admin tools, and premium plans."
  },
  {
    id: "edge_midway_revision",
    category: "edge" as const,
    prompt: "Modify the current project app so admins get analytics and premium users can export data."
  },
  {
    id: "edge_under_specified_data",
    category: "edge" as const,
    prompt: "Make a dashboard for my team with charts and reports."
  },
  {
    id: "edge_hallucination_guard",
    category: "edge" as const,
    prompt: "Create a system with contacts but make sure UI forms do not invent fields that APIs and tables cannot store."
  },
  {
    id: "edge_access_pressure",
    category: "edge" as const,
    prompt:
      "Build a customer app where guests browse records, users edit owned records, managers approve records, and admins manage analytics."
  }
];
