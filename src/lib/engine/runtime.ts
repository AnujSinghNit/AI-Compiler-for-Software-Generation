import type { AppSpec } from "./types";

export function compileRuntime(spec: AppSpec): AppSpec {
  const runnable =
    spec.ui.pages.length > 0 &&
    spec.api.endpoints.length > 0 &&
    spec.database.tables.length > 0 &&
    spec.ui.pages.every((page) => page.components.length > 0);

  return {
    ...spec,
    executionReport: {
      status: runnable ? "ready" : "failed",
      runnable,
      pagesCompiled: spec.ui.pages.length,
      endpointsCompiled: spec.api.endpoints.length,
      tablesCompiled: spec.database.tables.length,
      notes: runnable
        ? [
            "Pages can be rendered by the local runtime preview.",
            "Endpoints map to in-memory table operations.",
            "Auth roles are available for route and endpoint checks."
          ]
        : ["Runtime compilation failed because one or more execution layers are empty."]
    }
  };
}
