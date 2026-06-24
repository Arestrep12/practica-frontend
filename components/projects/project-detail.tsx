"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  deploymentStatusLabels,
  runtimeLabels,
  type Deployment,
  type DeploymentStatus,
  type Project,
} from "@/lib/mock-projects";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
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
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { DateRange } from "react-day-picker";

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
          <Link href="/" className="font-display text-lg font-bold tracking-tight">
            IDP
          </Link>
          <ChevronRight className="size-4 text-border" strokeWidth={2} aria-hidden />
          <Link
            href="/dashboard"
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
          href="/dashboard"
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => project.deployments.find((d) => d.id === selectedId) ?? null,
    [project.deployments, selectedId],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <ul className="lg:col-span-2 idp-radius-lg overflow-hidden rounded-lg border border-border">
        {project.deployments.map((d, i) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => setSelectedId(d.id)}
              aria-current={selectedId === d.id ? "true" : undefined}
              className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors ${
                i > 0 ? "border-t border-border" : ""
              } ${selectedId === d.id ? "bg-surface" : "bg-white hover:bg-surface"}`}
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
                  selectedId === d.id ? "text-navy" : "text-border"
                }`}
                strokeWidth={2}
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>

      <div className="lg:col-span-1">
        {selected ? (
          <DeploymentDetail deployment={selected} />
        ) : (
          <div className="idp-radius-lg rounded-lg border border-dashed border-border bg-surface/50 p-8 text-center text-sm text-muted">
            Selecciona un deployment para ver su detalle y logs.
          </div>
        )}
      </div>
    </div>
  );
}

function DeploymentDetail({ deployment }: { deployment: Deployment }) {
  const logs = useMemo(() => buildMockLogs(deployment), [deployment]);

  return (
    <div className="idp-radius-lg rounded-lg border border-border bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-navy">Deployment</h3>
        <StatusBadge status={deployment.status} />
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">ID</dt>
          <dd className="flex items-center gap-1">
            <code className="font-mono text-xs text-navy">{deployment.id}</code>
            <CopyButton value={deployment.id} label="ID del deployment" />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Commit</dt>
          <dd className="flex items-center gap-1">
            <code className="font-mono text-xs text-navy">{deployment.commitSha}</code>
            <CopyButton value={deployment.commitSha} label="commit SHA" />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Entorno</dt>
          <dd className="text-navy">{deployment.environment}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Autor</dt>
          <dd className="text-navy">{deployment.author}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Duración</dt>
          <dd className="inline-flex items-center gap-1 text-navy">
            <Clock className="size-3.5 text-muted" strokeWidth={2} aria-hidden />
            {formatDuration(deployment.durationMs)}
          </dd>
        </div>
      </dl>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Logs</p>
        <pre className="mt-2 max-h-64 overflow-auto idp-radius-md rounded-md bg-navy-deep p-3 font-mono text-xs leading-relaxed">
          {logs.map((line, i) => (
            <div key={i} className={logLineClass(line)}>
              {line}
            </div>
          ))}
        </pre>
      </div>
    </div>
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

function logLineClass(line: string): string {
  const { level } = parseLog(line);
  if (level === "error") return "text-red-400";
  if (level === "success") return "text-emerald-300";
  return "text-blue-light/90";
}

function LogLevelIcon({ level }: { level: LogLevel }) {
  if (level === "success") {
    return <Check className="size-4 shrink-0 text-emerald-600" strokeWidth={2.5} aria-label="Éxito" />;
  }
  if (level === "error") {
    return <CircleX className="size-4 shrink-0 text-red-500" strokeWidth={2} aria-label="Error" />;
  }
  return (
    <Circle className="size-4 shrink-0 fill-white text-muted" strokeWidth={2} aria-label="Información" />
  );
}

function statusToLevel(status: DeploymentStatus): LogLevel {
  if (status === "active") return "success";
  if (status === "error") return "error";
  return "info";
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

function matchesFilter(deployment: Deployment, filter: LogFilter): boolean {
  const { range, timeFrom, timeTo } = filter;
  if (!range?.from && !range?.to && !timeFrom && !timeTo) return true;

  const t = new Date(deployment.timestamp).getTime();
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

function LogsTab({ project }: { project: Project }) {
  const [filter, setFilter] = useState<LogFilter>(emptyFilter);
  const isFiltered = Boolean(filter.range?.from || filter.timeFrom || filter.timeTo);

  const filteredDeployments = useMemo(
    () => project.deployments.filter((d) => matchesFilter(d, filter)),
    [project.deployments, filter],
  );
  const hasLive = filteredDeployments.some((d) => d.status === "active");

  return (
    <section className="idp-radius-lg rounded-lg border border-border bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-muted" strokeWidth={2} aria-hidden />
          <h2 className="font-display text-lg font-bold text-navy">Logs</h2>
          {hasLive && (
            <span className="inline-flex items-center gap-1.5 idp-radius-md rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden />
              En vivo
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <DateTimeFilter value={filter} onChange={setFilter} />
          <Button variant="outline" size="sm">
            <RotateCw aria-hidden />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted">
        <Filter className="size-3" strokeWidth={2} aria-hidden />
        <span>
          {filteredDeployments.length}{" "}
          {filteredDeployments.length === 1 ? "evento" : "eventos"}
          {isFiltered ? " en el rango seleccionado" : " en total"}
        </span>
      </div>

      {filteredDeployments.length === 0 ? (
        <div className="mt-4 idp-radius-md rounded-md border border-dashed border-border bg-surface/50 px-4 py-10 text-center text-sm text-muted">
          No hay deployments en el rango de fecha y hora seleccionado.
        </div>
      ) : (
        <ul className="mt-4 max-h-[28rem] overflow-auto idp-radius-md rounded-md border border-border">
          {filteredDeployments.map((d, i) => {
            const date = new Date(d.timestamp);
            return (
              <li
                key={d.id}
                className={`flex items-center gap-3 bg-white px-4 py-3 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <LogLevelIcon level={statusToLevel(d.status)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-navy">{d.commitMessage}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted">
                    <code className="font-mono">{d.commitSha}</code>
                    <span aria-hidden>·</span>
                    <span>{d.environment}</span>
                    <span aria-hidden>·</span>
                    <span>{deploymentStatusLabels[d.status]}</span>
                  </div>
                </div>
                <time
                  dateTime={d.timestamp}
                  className="shrink-0 text-right font-mono text-xs tabular-nums text-muted"
                >
                  {format(date, "d MMM", { locale: es })}
                  <br />
                  {format(date, "HH:mm")}
                </time>
              </li>
            );
          })}
        </ul>
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

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
  const [mounted, setMounted] = useState(false);
  const canDelete = confirmText === project.name;

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return null;

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
