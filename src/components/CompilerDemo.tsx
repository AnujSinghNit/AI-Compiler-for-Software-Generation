"use client";

import {
  Activity,
  AlertTriangle,
  Braces,
  CheckCircle2,
  Database,
  FileJson,
  Gauge,
  Hammer,
  Layers3,
  Play,
  RefreshCcw,
  Route,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useMemo, useState } from "react";
import type { BenchmarkReport, BuildResult, BuildRequest } from "@/lib/engine/types";

const samplePrompt =
  "Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.";

type Tab = "json" | "runtime" | "validation" | "metrics" | "eval";

const stageIcons = [Sparkles, Layers3, Braces, Hammer, ShieldCheck, Play];

export function CompilerDemo() {
  const [prompt, setPrompt] = useState(samplePrompt);
  const [mode, setMode] = useState<BuildRequest["mode"]>("auto");
  const [changeRequest, setChangeRequest] = useState("");
  const [run, setRun] = useState<BuildResult | null>(null);
  const [evalReport, setEvalReport] = useState<BenchmarkReport | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("runtime");
  const [busy, setBusy] = useState(false);
  const [evalBusy, setEvalBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPage = useMemo(() => run?.spec.ui.pages[0], [run]);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const payload: BuildRequest = {
        prompt,
        mode,
        previousSpec: run?.spec,
        changeRequest: changeRequest.trim() || undefined
      };
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Generation failed");
      }

      setRun(data);
      setActiveTab("runtime");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  async function evaluate() {
    setEvalBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/evaluate", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Evaluation failed");
      }
      setEvalReport(data);
      setActiveTab("eval");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Evaluation failed");
    } finally {
      setEvalBusy(false);
    }
  }

  const tabs: Array<{ id: Tab; label: string; icon: any }> = [
    { id: "runtime", label: "Runtime", icon: Play },
    { id: "json", label: "Spec", icon: FileJson },
    { id: "validation", label: "Status", icon: ShieldCheck },
    { id: "metrics", label: "Insights", icon: Gauge },
    { id: "eval", label: "Benchmarks", icon: Activity }
  ];

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <Layers3 size={24} />
          </div>
          <div>
            <h1>Nexus AI Compiler</h1>
            <p className="subtitle">AI Compiler for Software Generation</p>
            <p>Deterministic architecture engine for rapid prototyping.</p>
          </div>
        </div>
        <div className="status-row">
          <span className={`pill ${run?.validation.valid ? "good" : run ? "warn" : ""}`}>
            {run?.validation.valid ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {run ? run.spec.executionReport.status : "Ready"}
          </span>
          <span className="pill">
            <Database size={16} />
            {run ? `${run.spec.database.tables.length} tables` : "No schema"}
          </span>
          <span className="pill">
            <Route size={16} />
            {run ? `${run.spec.api.endpoints.length} routes` : "No API"}
          </span>
        </div>
      </header>

      <section className="workspace">
        <aside className="panel input-panel">
          <div className="panel-title">
            <h2>Product Intent</h2>
            <button
              className="button"
              type="button"
              title="Reset"
              onClick={() => {
                setPrompt(samplePrompt);
                setChangeRequest("");
              }}
            >
              <RefreshCcw size={16} />
            </button>
          </div>

          <textarea
            className="prompt-box"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe your application..."
          />

          <div className="control-row">
            <label className="field-label">
              Engine
              <select value={mode} onChange={(event) => setMode(event.target.value as BuildRequest["mode"])}>
                <option value="auto">Auto-Select</option>
                <option value="gemini">Gemini Pro</option>
                <option value="openai">GPT-4o</option>
                <option value="fallback">Deterministic</option>
              </select>
            </label>
            <label className="field-label">
              Workflow
              <select
                value={changeRequest ? "change" : "fresh"}
                onChange={(event) => {
                  if (event.target.value === "fresh") {
                    setChangeRequest("");
                  } else if (!changeRequest) {
                    setChangeRequest("Refine the previous build with analytics.");
                  }
                }}
              >
                <option value="fresh">Fresh Build</option>
                <option value="change">Refinement</option>
              </select>
            </label>
          </div>

          {changeRequest ? (
            <textarea
              className="prompt-box"
              style={{ minHeight: 90 }}
              value={changeRequest}
              onChange={(event) => setChangeRequest(event.target.value)}
              placeholder="What should change?"
            />
          ) : null}

          <div className="button-row">
            <button className="button primary" type="button" onClick={generate} disabled={busy || !prompt.trim()}>
              <Play size={18} />
              {busy ? "Building..." : "Start Build"}
            </button>
            <button className="button" type="button" onClick={evaluate} disabled={evalBusy}>
              <Activity size={18} />
              {evalBusy ? "Benchmarking..." : "Run Tests"}
            </button>
          </div>

          {error ? <div className="error-banner">{error}</div> : null}

          <div className="stage-list">
            {(run?.stages ?? defaultStages()).map((stage, index) => {
              const Icon = stageIcons[index] ?? Sparkles;
              const isActive = stage.status !== "idle";
              return (
                <div className={`stage-item ${isActive ? "active" : ""}`} key={`${stage.name}-${index}`}>
                  <Icon size={18} />
                  <div>
                    <strong>{stage.name}</strong>
                    <span>{stage.summary}</span>
                  </div>
                  <span className="stage-status">{stage.status}</span>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="panel output-panel">
          <div className="tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="tab-content">
            {!run && activeTab !== "eval" ? (
              <div className="empty-state">Configure your product intent to begin the build process.</div>
            ) : null}

            {run && activeTab === "json" ? <pre className="json-view">{JSON.stringify(run.spec, null, 2)}</pre> : null}

            {run && activeTab === "validation" ? (
              <ValidationView run={run} />
            ) : null}

            {run && activeTab === "metrics" ? <MetricsView run={run} /> : null}

            {run && activeTab === "runtime" ? (
              <RuntimeView run={run} selectedPageId={currentPage?.id} />
            ) : null}

            {activeTab === "eval" ? <EvaluationView report={evalReport} /> : null}
          </div>
        </section>
      </section>
    </main>
  );
}

function defaultStages() {
  return [
    { name: "Intent Analysis", summary: "Extracting core requirements", status: "idle" },
    { name: "Architecture", summary: "Designing system components", status: "idle" },
    { name: "Spec Generation", summary: "Compiling configurations", status: "idle" },
    { name: "Refinement", summary: "Optimizing cross-layer logic", status: "idle" },
    { name: "Validation", summary: "Ensuring schema integrity", status: "idle" },
    { name: "Finalization", summary: "Preparing for execution", status: "idle" }
  ];
}

function ValidationView({ run }: { run: BuildResult }) {
  return (
    <>
      <div className="metric-grid">
        <div className="metric">
          <span>Success</span>
          <strong>{run.validation.valid ? "100%" : "Partial"}</strong>
        </div>
        <div className="metric">
          <span>Validation</span>
          <strong>{run.validation.issues.length} Issues</strong>
        </div>
        <div className="metric">
          <span>Self-Repair</span>
          <strong>{run.repairs.length} Fixes</strong>
        </div>
        <div className="metric">
          <span>Integrity</span>
          <strong>High</strong>
        </div>
      </div>
      <div className="issue-list">
        {run.validation.issues.length === 0 ? (
          <div className="issue">
            <strong>All Checks Passed</strong>
            <p>The build configuration meets all architectural requirements.</p>
          </div>
        ) : (
          run.validation.issues.map((issue) => (
            <div className={`issue ${issue.severity}`} key={issue.id}>
              <strong>{issue.code}</strong>
              <p>{issue.message}</p>
            </div>
          ))
        )}
      </div>
      <h3 style={{ marginTop: 24, fontSize: '0.9rem', color: 'var(--text-dim)' }}>Repair History</h3>
      <div className="repair-list">
        {run.repairs.length === 0 ? (
          <p className="empty-state">No repairs required for this build.</p>
        ) : (
          run.repairs.map((repair) => (
            <div className="repair" key={repair.id}>
              <strong>{repair.action}</strong>
              <p>{repair.description}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function MetricsView({ run }: { run: BuildResult }) {
  return (
    <>
      <div className="metric-grid">
        <div className="metric">
          <span>Latency</span>
          <strong>{run.metrics.latencyMs}ms</strong>
        </div>
        <div className="metric">
          <span>Source</span>
          <strong>{run.metrics.providerMode}</strong>
        </div>
        <div className="metric">
          <span>Est. Cost</span>
          <strong>${run.metrics.estimatedCostUsd.toFixed(5)}</strong>
        </div>
        <div className="metric">
          <span>Resiliency</span>
          <strong>{run.metrics.retries === 0 ? "Perfect" : "High"}</strong>
        </div>
      </div>
      <div className="endpoint-list">
        <h3 style={{ padding: '0 12px', fontSize: '0.9rem', marginBottom: 8 }}>System Assumptions</h3>
        {run.spec.assumptions.map((assumption) => (
          <div className="endpoint" key={assumption}>
            <strong>Constraint</strong>
            <p>{assumption}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function RuntimeView({ run, selectedPageId }: { run: BuildResult; selectedPageId?: string }) {
  const selectedPage = run.spec.ui.pages.find((page) => page.id === selectedPageId) ?? run.spec.ui.pages[0];

  return (
    <div className="runtime-layout">
      <nav className="runtime-nav" aria-label="Sitemap">
        {run.spec.ui.pages.map((page) => (
          <div className="runtime-page" key={page.id}>
            <strong>{page.title}</strong>
            <p>{page.path}</p>
            <div className="field-chips">
              {page.requiredRoles.map((role) => (
                <span className="chip" key={role}>
                  {role}
                </span>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <section className="runtime-surface">
        <div className="runtime-header">
          <div>
            <h3>{selectedPage.title}</h3>
            <p className="field-label">{selectedPage.path}</p>
          </div>
          <span className="pill good">
            <CheckCircle2 size={16} />
            {run.spec.executionReport.runnable ? "Ready for Deploy" : "Validation Needed"}
          </span>
        </div>
        <div className="component-grid">
          {selectedPage.components.map((component) => (
            <div className="component-tile" key={component.id}>
              <strong>{component.title}</strong>
              <p>{component.type.toUpperCase()}</p>
              <div className="field-chips">
                {component.fields.map((field) => (
                  <span className="chip" key={field}>
                    {field}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Path</th>
                <th>Method</th>
                <th>Entity</th>
                <th>Access</th>
              </tr>
            </thead>
            <tbody>
              {run.spec.api.endpoints.slice(0, 10).map((endpoint) => (
                <tr key={endpoint.id}>
                  <td>{endpoint.path}</td>
                  <td>{endpoint.method}</td>
                  <td>{endpoint.entity}</td>
                  <td>{endpoint.requiredRole}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function EvaluationView({ report }: { report: BenchmarkReport | null }) {
  if (!report) {
    return <div className="empty-state">Run system benchmarks to analyze dataset performance.</div>;
  }

  return (
    <>
      <div className="metric-grid">
        <div className="metric">
          <span>Success Rate</span>
          <strong>{Math.round(report.summary.successRate * 100)}%</strong>
        </div>
        <div className="metric">
          <span>Test Volume</span>
          <strong>{report.summary.total}</strong>
        </div>
        <div className="metric">
          <span>Avg Latency</span>
          <strong>{report.summary.averageLatencyMs}ms</strong>
        </div>
        <div className="metric">
          <span>Stability</span>
          <strong>High</strong>
        </div>
      </div>
      <div className="endpoint-list">
        <h3 style={{ padding: '0 12px', fontSize: '0.9rem', marginBottom: 8 }}>Test Results</h3>
        {report.results.map((result) => (
          <div className="endpoint" key={result.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <strong>{result.category}</strong>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{result.providerMode}</span>
            </div>
            <p style={{ fontSize: '0.85rem' }}>{result.prompt}</p>
            <div style={{ marginTop: 8 }}>
              <span className={`chip ${result.success ? "good" : "warn"}`} style={{ padding: '2px 8px' }}>
                {result.success ? "Passed" : "Needs Review"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
