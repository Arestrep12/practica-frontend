"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  runtimeLabels,
  type Deployment,
  type Project,
} from "@/lib/mock-projects";
import {
  buildRuntimeLogs,
  runtimeStatusBucket,
  statusFilters,
  type RuntimeLog,
  type RuntimeMethod,
  type RuntimeStatusFilter,
} from "@/lib/mock-runtime-logs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  CircleX,
  Clock,
  Copy,
  ExternalLink,
  Filter,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  Globe,
  Plus,
  RotateCw,
  Server,
  Terminal,
  Trash2,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { DateRange } from "react-day-picker";
import { Link } from "react-router-dom";

type TabId = "overview" | "deployments" | "logs" | "settings";

const tabs: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "deployments", label: "Deployments" },
  { id: "logs", label: "Logs" },
  { id: "settings", label: "Settings" },
];

function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1 rounded p-1 text-muted transition-colors hover:bg-surface hover:text-navy"
      aria-label={`Copiar ${label}`}
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-600" strokeWidth={2} aria-hidden />
      ) : (
        <Copy className="size-3.5" strokeWidth={2} aria-hidden />
      )}
    </button>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  const [tab, setTab] = useState<TabId>("overview");
  const latest = project.deployments[0];

  return (
    <div className="min-h-screen bg-white text-navy">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
          <Link to="/" className="font-display text-lg font-bold tracking-tight">
            IDP
          </Link>
          <ChevronRight className="size-4 text-border" strokeWidth={2} aria-hidden />
          <Link
            to="/dashboard"
            className="text-sm text-muted transition-colors hover:text-navy"
          >
            Proyectos
          </Link>
          <ChevronRight className="size-4 text-border" strokeWidth={2} aria-hidden />
          <span className="truncate text-sm font-medium text-navy">{project.name}</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-navy"
        >
          <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
          Volver al dashboard
        </Link>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="font-display truncate text-2xl font-bold text-navy">
                {project.name}
              </h1>
              <StatusBadge status={latest.status} />
            </div>
            <a
              href={`https://${project.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-blue-accent"
            >
              <Globe className="size-3.5" strokeWidth={2} aria-hidden />
              {project.url}
              <ExternalLink className="size-3" strokeWidth={2} aria-hidden />
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <a
              href={`https://${project.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 idp-radius-md rounded-md border border-border bg-white px-4 text-sm font-medium text-navy transition-colors hover:bg-surface"
            >
              <ExternalLink className="size-4" strokeWidth={2} aria-hidden />
              Visitar
            </a>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 idp-radius-md rounded-md bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
            >
              <RotateCw className="size-4" strokeWidth={2} aria-hidden />
              Redeploy
            </button>
          </div>
        </div>

        <nav className="mt-8 flex gap-1 border-b border-border" aria-label="Secciones del proyecto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "border-navy text-navy"
                  : "border-transparent text-muted hover:text-navy"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div key={tab} className="idp-tab-panel mt-8">
          {tab === "overview" && (
            <OverviewTab
              project={project}
              onOpenDeployments={() => setTab("deployments")}
              onOpenSettings={() => setTab("settings")}
            />
          )}
          {tab === "deployments" && <DeploymentsTab project={project} />}
          {tab === "logs" && <LogsTab project={project} />}
          {tab === "settings" && <SettingsTab project={project} />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({
  project,
  onOpenDeployments,
  onOpenSettings,
}: {
  project: Project;
  onOpenDeployments: () => void;
  onOpenSettings: () => void;
}) {
  const latest = project.deployments[0];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="idp-radius-lg rounded-lg border border-border bg-white p-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-navy">Producción</h2>
          <StatusBadge status={latest.status} />
        </div>

        <a
          href={`https://${project.url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-accent transition-colors hover:underline"
        >
          <Globe className="size-4" strokeWidth={2} aria-hidden />
          {project.url}
          <ExternalLink className="size-3.5" strokeWidth={2} aria-hidden />
        </a>

        <div className="mt-6 idp-radius-md rounded-md border border-border bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Último deployment
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-1.5 text-navy">
              <GitCommitHorizontal className="size-4 text-muted" strokeWidth={2} aria-hidden />
              <code className="font-mono text-xs">{latest.commitSha}</code>
            </span>
            <span className="text-navy">{latest.commitMessage}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <GitBranch className="size-3" strokeWidth={2} aria-hidden />
              {latest.branch}
            </span>
            <span aria-hidden>·</span>
            <span>{latest.author}</span>
            <span aria-hidden>·</span>
            <span>{latest.createdAt}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenDeployments}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-navy"
        >
          Ver todos los deployments
          <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
        </button>
      </section>

      <section className="idp-radius-lg rounded-lg border border-border bg-white p-6">
        <h2 className="font-display text-lg font-bold text-navy">Resumen</h2>
        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-muted">Runtime</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-navy">
              <Server className="size-3.5 text-muted" strokeWidth={2} aria-hidden />
              {runtimeLabels[project.runtime] ?? project.runtime}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-muted">Entorno</dt>
            <dd className="mt-1 text-navy">{project.environment}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-muted">
              Repositorio
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-navy">
              <GitFork className="size-3.5 text-muted" strokeWidth={2} aria-hidden />
              <span className="truncate">{project.repository}</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-muted">
              Rama por defecto
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-navy">
              <GitBranch className="size-3.5 text-muted" strokeWidth={2} aria-hidden />
              {project.branch}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onOpenSettings}
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-navy"
        >
          Ir a configuración
          <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
        </button>
      </section>
    </div>
  );
}

function DeploymentsTab({ project }: { project: Project }) {
  const [selectedId, setSelectedId] = useState<string | null>(
    project.deployments[0]?.id ?? null,
  );
  const selected = useMemo(
    () => project.deployments.find((d) => d.id === selectedId) ?? project.deployments[0] ?? null,
    [project.deployments, selectedId],
  );

  return (
    <div className="space-y-6">
      {selected && <DeploymentDetail deployment={selected} />}

      <section>
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-navy">
              Historial de deployments
            </h2>
            <p className="text-sm text-muted">
              Selecciona un deployment para inspeccionar metadata y logs completos.
            </p>
          </div>
          <span className="text-xs font-medium uppercase tracking-widest text-muted">
            {project.deployments.length} eventos
          </span>
        </div>

        <ul className="idp-radius-lg overflow-hidden rounded-lg border border-border">
          {project.deployments.map((d, i) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => setSelectedId(d.id)}
                aria-current={selected?.id === d.id ? "true" : undefined}
                className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors ${
                  i > 0 ? "border-t border-border" : ""
                } ${selected?.id === d.id ? "bg-surface" : "bg-white hover:bg-surface"}`}
              >
                <StatusBadge status={d.status} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">{d.commitMessage}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted">
                    <code className="font-mono">{d.commitSha}</code>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1">
                      <GitBranch className="size-3" strokeWidth={2} aria-hidden />
                      {d.branch}
                    </span>
                    <span aria-hidden>·</span>
                    <span>{d.environment}</span>
                    <span aria-hidden>·</span>
                    <span>{d.createdAt}</span>
                  </div>
                </div>
                <ChevronRight
                  className={`size-4 shrink-0 transition-colors ${
                    selected?.id === d.id ? "text-navy" : "text-border"
                  }`}
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function DeploymentDetail({ deployment }: { deployment: Deployment }) {
  const logs = useMemo(() => buildMockLogs(deployment), [deployment]);

  return (
    <section className="idp-radius-lg rounded-lg border border-border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-xl font-bold text-navy">Deployment</h2>
            <StatusBadge status={deployment.status} />
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            {deployment.commitMessage}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 text-sm text-muted">
          <Clock className="size-4" strokeWidth={2} aria-hidden />
          <span className="font-medium text-navy">{formatDuration(deployment.durationMs)}</span>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="idp-radius-md rounded-md border border-border bg-surface px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-widest text-muted">ID</dt>
          <dd className="mt-1 flex items-center gap-1">
            <code className="truncate font-mono text-sm text-navy">{deployment.id}</code>
            <CopyButton value={deployment.id} label="ID del deployment" />
          </dd>
        </div>
        <div className="idp-radius-md rounded-md border border-border bg-surface px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-widest text-muted">Commit</dt>
          <dd className="mt-1 flex items-center gap-1">
            <code className="truncate font-mono text-sm text-navy">{deployment.commitSha}</code>
            <CopyButton value={deployment.commitSha} label="commit SHA" />
          </dd>
        </div>
        <div className="idp-radius-md rounded-md border border-border bg-surface px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-widest text-muted">Entorno</dt>
          <dd className="mt-1 truncate text-sm font-medium text-navy">
            {deployment.environment}
          </dd>
        </div>
        <div className="idp-radius-md rounded-md border border-border bg-surface px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-widest text-muted">Autor</dt>
          <dd className="mt-1 truncate text-sm font-medium text-navy">{deployment.author}</dd>
        </div>
        <div className="idp-radius-md rounded-md border border-border bg-surface px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-widest text-muted">Duración</dt>
          <dd className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-navy">
            <Clock className="size-3.5 text-muted" strokeWidth={2} aria-hidden />
            {formatDuration(deployment.durationMs)}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-muted" strokeWidth={2} aria-hidden />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
              Logs
            </h3>
          </div>
          <span className="font-mono text-xs text-muted">{logs.length} líneas</span>
        </div>

        <div className="idp-radius-lg overflow-hidden rounded-lg border border-border bg-white">
          <div className="flex h-10 items-center justify-end border-b border-border bg-surface px-4">
            <code className="truncate font-mono text-xs text-muted">
              {deployment.id}
            </code>
          </div>

          <pre className="max-h-[26rem] overflow-auto bg-white p-4 font-mono text-[0.82rem] leading-6 text-navy sm:p-5 sm:text-sm">
            <code className="block min-w-max">
              {logs.map((line, i) => (
                <LogTerminalLine key={`${deployment.id}-${i}`} line={line} />
              ))}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}

type LogLevel = "info" | "success" | "error";

type ParsedLog = { time: string; message: string; level: LogLevel };

function parseLog(line: string): ParsedLog {
  const match = line.match(/^\[([^\]]+)\]\s*(.*)$/);
  const time = match ? match[1] : "";
  const message = match ? match[2] : line;

  let level: LogLevel = "info";
  if (message.includes("ERROR") || message.includes("abortado")) {
    level = "error";
  } else if (
    message.includes("OK") ||
    message.includes("correctamente") ||
    message.includes("Activo") ||
    message.includes("completado")
  ) {
    level = "success";
  }

  return { time, message, level };
}

function LogTerminalLine({ line }: { line: string }) {
  const { time, message, level } = parseLog(line);
  const messageClass =
    level === "error"
      ? "text-red-700"
      : level === "success"
        ? "text-emerald-700"
        : "text-navy";

  return (
    <span className="block whitespace-pre">
      {time && <span className="text-blue-accent">[{time}]</span>}
      {time && " "}
      <span className={messageClass}>{message}</span>
    </span>
  );
}

type LogFilter = { range?: DateRange; timeFrom: string; timeTo: string };

const emptyFilter: LogFilter = { range: undefined, timeFrom: "", timeTo: "" };

function combineDateTime(day: Date, time: string, fallback: "start" | "end"): number {
  const d = new Date(day);
  if (time) {
    const [h, m] = time.split(":").map(Number);
    d.setHours(h, m, fallback === "end" ? 59 : 0, fallback === "end" ? 999 : 0);
  } else {
    d.setHours(fallback === "end" ? 23 : 0, fallback === "end" ? 59 : 0, fallback === "end" ? 59 : 0, fallback === "end" ? 999 : 0);
  }
  return d.getTime();
}

function matchesRuntimeLogFilter(log: RuntimeLog, filter: LogFilter): boolean {
  const { range, timeFrom, timeTo } = filter;
  if (!range?.from && !range?.to && !timeFrom && !timeTo) return true;

  const t = new Date(log.timestamp).getTime();
  const fromDay = range?.from;
  const toDay = range?.to ?? range?.from;

  if (fromDay && t < combineDateTime(fromDay, timeFrom, "start")) return false;
  if (toDay && t > combineDateTime(toDay, timeTo, "end")) return false;
  return true;
}

function filterSummary(filter: LogFilter): string {
  const { range, timeFrom, timeTo } = filter;
  if (!range?.from && !timeFrom && !timeTo) return "Filtrar fecha y hora";

  const parts: string[] = [];
  if (range?.from) {
    const from = format(range.from, "d MMM", { locale: es });
    const to = range.to ? format(range.to, "d MMM", { locale: es }) : null;
    parts.push(to && to !== from ? `${from} – ${to}` : from);
  }
  if (timeFrom || timeTo) {
    parts.push(`${timeFrom || "00:00"}–${timeTo || "23:59"}`);
  }
  return parts.join(" · ");
}

function matchesStatusFilter(log: RuntimeLog, filter: RuntimeStatusFilter): boolean {
  return filter === "all" || runtimeStatusBucket(log.statusCode) === filter;
}

function statusCodeClass(statusCode: RuntimeLog["statusCode"]): string {
  if (statusCode >= 500) return "border-red-200 bg-red-50 text-red-700";
  if (statusCode >= 400) return "border-amber-200 bg-amber-50 text-amber-700";
  if (statusCode >= 300) return "border-blue-light bg-blue-light text-blue-accent";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function methodClass(method: RuntimeMethod): string {
  if (method === "POST") return "text-blue-accent";
  if (method === "PUT" || method === "PATCH") return "text-amber-700";
  if (method === "DELETE") return "text-red-700";
  return "text-navy";
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

function LogsTab({ project }: { project: Project }) {
  const [filter, setFilter] = useState<LogFilter>(emptyFilter);
  const [statusFilter, setStatusFilter] = useState<RuntimeStatusFilter>("all");
  const isFiltered = Boolean(filter.range?.from || filter.timeFrom || filter.timeTo);

  const runtimeLogs = useMemo(() => buildRuntimeLogs(project), [project]);

  const filteredLogs = useMemo(
    () =>
      runtimeLogs.filter(
        (log) => matchesRuntimeLogFilter(log, filter) && matchesStatusFilter(log, statusFilter),
      ),
    [filter, runtimeLogs, statusFilter],
  );

  const metrics = useMemo(() => {
    const total = filteredLogs.length;
    const errors = filteredLogs.filter((log) => log.statusCode >= 500).length;
    const warning = filteredLogs.filter(
      (log) => log.statusCode >= 400 && log.statusCode < 500,
    ).length;
    const ok = filteredLogs.filter((log) => log.statusCode < 400).length;
    const p95 = percentile(
      filteredLogs.map((log) => log.latencyMs),
      95,
    );

    return {
      total,
      ok,
      warning,
      errors,
      errorRate: total === 0 ? 0 : Math.round((errors / total) * 100),
      p95,
    };
  }, [filteredLogs]);

  return (
    <section className="idp-radius-lg rounded-lg border border-border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-muted" strokeWidth={2} aria-hidden />
            <h2 className="font-display text-lg font-bold text-navy">Logs de aplicación</h2>
            <span className="inline-flex items-center gap-1.5 idp-radius-md rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
              Mock runtime
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">
            Tráfico runtime de ejemplo para {project.url}: códigos HTTP, latencia y origen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateTimeFilter value={filter} onChange={setFilter} />
          <Button variant="outline" size="sm">
            <RotateCw aria-hidden />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="idp-radius-md rounded-md border border-border bg-surface px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Requests</p>
          <p className="mt-1 font-display text-2xl font-bold text-navy">{metrics.total}</p>
        </div>
        <div className="idp-radius-md rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">2xx/3xx</p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-700">{metrics.ok}</p>
        </div>
        <div className="idp-radius-md rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700">4xx</p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-700">{metrics.warning}</p>
        </div>
        <div className="idp-radius-md rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-700">5xx / p95</p>
          <p className="mt-1 font-display text-2xl font-bold text-red-700">
            {metrics.errors}
            <span className="ml-2 align-middle font-mono text-sm font-medium text-muted">
              {metrics.p95}ms
            </span>
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Filter className="size-3" strokeWidth={2} aria-hidden />
          <span>
            {filteredLogs.length} {filteredLogs.length === 1 ? "evento" : "eventos"}
            {isFiltered ? " en el rango seleccionado" : " en la ventana actual"} ·{" "}
            {metrics.errorRate}% error rate
          </span>
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Filtrar por código HTTP">
          {statusFilters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatusFilter(item.id)}
              aria-pressed={statusFilter === item.id}
              className={`idp-radius-md rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === item.id
                  ? "border-navy bg-navy text-white"
                  : "border-border bg-white text-muted hover:bg-surface hover:text-navy"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="mt-4 idp-radius-md rounded-md border border-dashed border-border bg-surface/50 px-4 py-10 text-center text-sm text-muted">
          No hay logs HTTP en el rango y filtro seleccionados.
        </div>
      ) : (
        <div className="mt-4 idp-radius-lg overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-[5rem_5rem_minmax(14rem,1fr)_5rem_6rem_7rem] gap-3 border-b border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted">
            <span>Hora</span>
            <span>Método</span>
            <span>Ruta</span>
            <span>Status</span>
            <span>Latencia</span>
            <span>Origen</span>
          </div>

          <ul className="max-h-[32rem] overflow-auto bg-white">
            {filteredLogs.map((log, i) => {
              const date = new Date(log.timestamp);

              return (
                <li key={log.id} className={i > 0 ? "border-t border-border" : ""}>
                  <Link
                    to={`/projects/${project.id}/logs/${log.id}`}
                    className="grid min-w-[48rem] grid-cols-[5rem_5rem_minmax(14rem,1fr)_5rem_6rem_7rem] gap-3 px-4 py-3 font-mono text-xs transition-colors hover:bg-surface"
                  >
                    <time
                      dateTime={log.timestamp}
                      className="tabular-nums text-muted"
                      title={format(date, "d MMM yyyy HH:mm:ss", { locale: es })}
                    >
                      {format(date, "HH:mm:ss")}
                    </time>
                    <span className={`font-semibold ${methodClass(log.method)}`}>{log.method}</span>
                    <span className="truncate text-navy" title={log.path}>
                      {log.path}
                    </span>
                    <span
                      className={`inline-flex w-fit min-w-12 justify-center rounded border px-2 py-0.5 font-semibold ${statusCodeClass(
                        log.statusCode,
                      )}`}
                    >
                      {log.statusCode}
                    </span>
                    <span className="tabular-nums text-navy">{log.latencyMs}ms</span>
                    <span className="truncate text-muted" title={`${log.source} · ${log.traceId}`}>
                      {log.source}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
function DateTimeFilter({
  value,
  onChange,
}: {
  value: LogFilter;
  onChange: (filter: LogFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<LogFilter>(value);
  const isActive = Boolean(value.range?.from || value.timeFrom || value.timeTo);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setDraft(value);
        setOpen(nextOpen);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={isActive ? "border-blue-accent" : undefined}>
          <CalendarDays aria-hidden />
          <span className="max-w-[16rem] truncate">{filterSummary(value)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <div className="p-3">
          <Calendar
            mode="range"
            selected={draft.range}
            onSelect={(range) => setDraft((d) => ({ ...d, range }))}
            numberOfMonths={1}
            autoFocus
          />
        </div>

        <div className="border-t border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Hora del día
          </p>
          <div className="mt-2 flex items-center gap-2">
            <label className="flex flex-1 flex-col gap-1 text-xs text-muted">
              Desde
              <input
                type="time"
                value={draft.timeFrom}
                onChange={(e) => setDraft((d) => ({ ...d, timeFrom: e.target.value }))}
                className="idp-radius-md rounded-md border border-border bg-white px-2 py-1.5 text-sm text-navy outline-none transition-colors focus:border-blue-accent"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs text-muted">
              Hasta
              <input
                type="time"
                value={draft.timeTo}
                onChange={(e) => setDraft((d) => ({ ...d, timeTo: e.target.value }))}
                className="idp-radius-md rounded-md border border-border bg-white px-2 py-1.5 text-sm text-navy outline-none transition-colors focus:border-blue-accent"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraft(emptyFilter);
              onChange(emptyFilter);
              setOpen(false);
            }}
          >
            <X aria-hidden />
            Limpiar
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onChange(draft);
              setOpen(false);
            }}
          >
            Aplicar filtro
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function buildMockLogs(deployment: Deployment): string[] {
  const base = [
    `[00:00] Iniciando deployment ${deployment.id}`,
    `[00:02] Clonando ${deployment.branch} @ ${deployment.commitSha}`,
    "[00:08] Resolviendo runtime profile...",
    "[00:14] Construyendo artefacto",
    "[00:51] Build completado",
    `[00:53] Publicando en entorno ${deployment.environment}`,
  ];

  if (deployment.status === "error") {
    return [
      ...base,
      "[01:04] ERROR: health check falló tras 30s",
      "[01:04] Deployment abortado y revertido",
    ];
  }

  if (deployment.status === "stopped") {
    return [...base, "[01:10] Deployment detenido manualmente"];
  }

  return [
    ...base,
    "[01:08] Health check OK",
    `[01:12] Activo en https://${deployment.environment}`,
    "[01:12] Deployment finalizado correctamente",
  ];
}

function SettingsTab({ project }: { project: Project }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <section className="idp-radius-lg rounded-lg border border-border bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-navy">Variables de entorno</h2>
            <p className="mt-1 text-sm text-muted">
              Secretos cifrados en el almacén; nunca se muestran en logs ni respuestas.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 idp-radius-md rounded-md border border-border bg-white px-3 text-sm font-medium text-navy transition-colors hover:bg-surface"
          >
            <Plus className="size-4" strokeWidth={2} aria-hidden />
            Añadir
          </button>
        </div>

        <ul className="mt-5 idp-radius-md overflow-hidden rounded-md border border-border">
          {project.envVars.map((v, i) => (
            <li
              key={v.key}
              className={`flex items-center gap-4 bg-white px-4 py-3 text-sm ${
                i > 0 ? "border-t border-border" : ""
              }`}
            >
              <code className="w-44 shrink-0 font-mono text-xs font-medium text-navy">
                {v.key}
              </code>
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-muted">
                {v.value}
              </code>
              <span className="shrink-0 idp-radius-sm rounded-sm bg-surface px-2 py-0.5 text-xs text-muted">
                {v.environment}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="idp-radius-lg rounded-lg border border-border bg-white p-6">
        <h2 className="font-display text-lg font-bold text-navy">General</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="idp-radius-md rounded-md border border-border bg-surface p-4">
            <dt className="text-xs font-semibold uppercase tracking-widest text-muted">
              Rama por defecto
            </dt>
            <dd className="mt-1.5 flex items-center gap-1.5 text-sm text-navy">
              <GitBranch className="size-3.5 text-muted" strokeWidth={2} aria-hidden />
              {project.branch}
            </dd>
          </div>
          <div className="idp-radius-md rounded-md border border-border bg-surface p-4">
            <dt className="text-xs font-semibold uppercase tracking-widest text-muted">
              Runtime (solo lectura)
            </dt>
            <dd className="mt-1.5 flex items-center gap-1.5 text-sm text-navy">
              <Server className="size-3.5 text-muted" strokeWidth={2} aria-hidden />
              {runtimeLabels[project.runtime] ?? project.runtime}
            </dd>
          </div>
        </dl>
      </section>

      <section className="idp-radius-lg rounded-lg border border-border bg-white p-6">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted" strokeWidth={2} aria-hidden />
          <h2 className="font-display text-lg font-bold text-navy">Miembros</h2>
        </div>
        <ul className="mt-5 idp-radius-md overflow-hidden rounded-md border border-border">
          {project.members.map((m, i) => (
            <li
              key={m.email}
              className={`flex items-center gap-3 bg-white px-4 py-3 ${
                i > 0 ? "border-t border-border" : ""
              }`}
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center idp-radius-md rounded-md bg-surface text-xs font-semibold text-muted"
                aria-hidden
              >
                {m.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-navy">{m.name}</p>
                <p className="truncate text-xs text-muted">{m.email}</p>
              </div>
              <span className="shrink-0 idp-radius-sm rounded-sm bg-surface px-2 py-0.5 text-xs text-muted">
                {m.role}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="idp-radius-lg rounded-lg border border-red-200 bg-red-50/50 p-6">
        <div className="flex items-center gap-2">
          <CircleX className="size-4 text-red-500" strokeWidth={2} aria-hidden />
          <h2 className="font-display text-lg font-bold text-red-700">Zona de peligro</h2>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-navy">Eliminar proyecto</p>
            <p className="mt-0.5 text-sm text-muted">
              Detiene todos los deployments y borra la configuración. Acción irreversible.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex h-10 shrink-0 items-center gap-2 idp-radius-md rounded-md border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            <Trash2 className="size-4" strokeWidth={2} aria-hidden />
            Eliminar
          </button>
        </div>
      </section>

      {showDeleteModal && (
        <DeleteProjectModal project={project} onClose={() => setShowDeleteModal(false)} />
      )}
    </div>
  );
}

function DeleteProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const canDelete = confirmText === project.name;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-navy-deep/60" onClick={onClose} aria-hidden />

      <div className="idp-tab-panel relative w-full max-w-md idp-radius-lg rounded-lg border border-border bg-white p-6 shadow-lg">
        <div className="flex items-start gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center idp-radius-md rounded-md bg-red-50 text-red-600"
            aria-hidden
          >
            <TriangleAlert className="size-5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h3 id="delete-modal-title" className="font-display text-lg font-bold text-navy">
              Eliminar proyecto
            </h3>
            <p className="mt-1 text-sm text-muted">
              Esta acción es <span className="font-semibold text-navy">irreversible</span>. Se
              detendrán todos los deployments y se borrará la configuración.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="confirm-name" className="block text-sm text-navy">
            Escribe{" "}
            <code className="idp-radius-sm rounded-sm bg-surface px-1.5 py-0.5 font-mono text-xs font-semibold text-navy">
              {project.name}
            </code>{" "}
            para confirmar.
          </label>
          <input
            id="confirm-name"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            autoFocus
            placeholder={project.name}
            className="mt-2 w-full idp-radius-md rounded-md border border-border bg-white px-3 py-2.5 text-sm text-navy outline-none transition-colors placeholder:text-muted focus:border-red-400"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center idp-radius-md rounded-md border border-border bg-white px-4 text-sm font-medium text-navy transition-colors hover:bg-surface"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canDelete}
            onClick={() => {
              // Acción de borrado pendiente de backend.
              onClose();
            }}
            className="inline-flex h-10 items-center gap-2 idp-radius-md rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-red-600"
          >
            <Trash2 className="size-4" strokeWidth={2} aria-hidden />
            Eliminar proyecto
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
