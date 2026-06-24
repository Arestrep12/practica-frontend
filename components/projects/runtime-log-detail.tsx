import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/mock-projects";
import { runtimeStatusBucket, type RuntimeLog, type RuntimeMethod } from "@/lib/mock-runtime-logs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  FileJson,
  Globe,
  Server,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

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
      className="inline-flex items-center rounded p-1 text-muted transition-colors hover:bg-surface hover:text-navy"
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

function runtimeMessage(log: RuntimeLog): string {
  if (log.statusCode >= 500) return "Error del runtime o dependencia interna.";
  if (log.statusCode >= 400) return "Respuesta esperada por validación, auth o límite.";
  if (log.statusCode >= 300) return "Redirección procesada por la capa de entrada.";
  return "Request completado correctamente.";
}

function buildMockRequestHeaders(project: Project, log: RuntimeLog): Record<string, string> {
  return {
    host: project.url,
    "x-request-id": log.traceId,
    "x-forwarded-proto": "https",
    "user-agent": "Internal-IDP-Mock/1.0",
  };
}

function buildMockResponseBody(log: RuntimeLog): string {
  if (log.statusCode >= 500) {
    return JSON.stringify(
      {
        error: "upstream_unavailable",
        message: "El servicio respondió con error temporal.",
        traceId: log.traceId,
      },
      null,
      2,
    );
  }

  if (log.statusCode >= 400) {
    return JSON.stringify(
      {
        error: "request_rejected",
        message: "La solicitud no cumple una política de la aplicación.",
        traceId: log.traceId,
      },
      null,
      2,
    );
  }

  return JSON.stringify(
    {
      ok: true,
      path: log.path,
      traceId: log.traceId,
    },
    null,
    2,
  );
}

export function RuntimeLogDetail({ project, log }: { project: Project; log: RuntimeLog }) {
  const date = new Date(log.timestamp);
  const headers = buildMockRequestHeaders(project, log);
  const responseBody = buildMockResponseBody(log);
  const bucket = runtimeStatusBucket(log.statusCode);

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
          <Link
            to={`/projects/${project.id}`}
            className="truncate text-sm text-muted transition-colors hover:text-navy"
          >
            {project.name}
          </Link>
          <ChevronRight className="size-4 text-border" strokeWidth={2} aria-hidden />
          <span className="truncate text-sm font-medium text-navy">Log runtime</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-navy"
        >
          <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
          Volver al proyecto
        </Link>

        <section className="mt-4 idp-radius-lg rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex min-w-14 justify-center rounded border px-2.5 py-1 font-mono text-sm font-bold ${statusCodeClass(
                    log.statusCode,
                  )}`}
                >
                  {log.statusCode}
                </span>
                <span className={`font-mono text-sm font-bold ${methodClass(log.method)}`}>
                  {log.method}
                </span>
                <h1 className="font-display truncate text-2xl font-bold text-navy">
                  {log.path}
                </h1>
              </div>
              <p className="mt-2 text-sm text-muted">{runtimeMessage(log)}</p>
            </div>

            <Button asChild variant="outline">
              <a href={`https://${project.url}${log.path}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden />
                Abrir endpoint
              </a>
            </Button>
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="idp-radius-md rounded-md border border-border bg-surface px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-widest text-muted">Hora</dt>
              <dd className="mt-1 font-mono text-sm text-navy">
                {format(date, "d MMM yyyy, HH:mm:ss", { locale: es })}
              </dd>
            </div>
            <div className="idp-radius-md rounded-md border border-border bg-surface px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-widest text-muted">Latencia</dt>
              <dd className="mt-1 inline-flex items-center gap-1 font-mono text-sm text-navy">
                <Clock className="size-3.5 text-muted" strokeWidth={2} aria-hidden />
                {log.latencyMs}ms
              </dd>
            </div>
            <div className="idp-radius-md rounded-md border border-border bg-surface px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-widest text-muted">Origen</dt>
              <dd className="mt-1 inline-flex items-center gap-1 font-mono text-sm text-navy">
                <Server className="size-3.5 text-muted" strokeWidth={2} aria-hidden />
                {log.source}
              </dd>
            </div>
            <div className="idp-radius-md rounded-md border border-border bg-surface px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-widest text-muted">Familia</dt>
              <dd className="mt-1 font-mono text-sm font-semibold text-navy">{bucket}</dd>
            </div>
          </dl>
        </section>

        <div className="mt-6">
          <section className="idp-radius-lg rounded-lg border border-border bg-white p-6">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-muted" strokeWidth={2} aria-hidden />
              <h2 className="font-display text-lg font-bold text-navy">Detalle de request</h2>
            </div>

            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted">Trace ID</dt>
                <dd className="mt-1 flex items-center gap-1">
                  <code className="font-mono text-sm text-navy">{log.traceId}</code>
                  <CopyButton value={log.traceId} label="trace ID" />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted">URL interna</dt>
                <dd className="mt-1 flex min-w-0 items-center gap-1">
                  <Globe className="size-3.5 shrink-0 text-muted" strokeWidth={2} aria-hidden />
                  <code className="truncate font-mono text-sm text-navy">
                    https://{project.url}
                    {log.path}
                  </code>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted">Headers</dt>
                <dd className="mt-2 idp-radius-md rounded-md border border-border bg-surface p-3">
                  <pre className="overflow-auto font-mono text-xs leading-6 text-navy">
                    {Object.entries(headers).map(([key, value]) => `${key}: ${value}`).join("\n")}
                  </pre>
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="mt-6 idp-radius-lg rounded-lg border border-border bg-white p-6">
          <div className="flex items-center gap-2">
            {log.statusCode >= 400 ? (
              <ShieldAlert className="size-4 text-amber-600" strokeWidth={2} aria-hidden />
            ) : (
              <FileJson className="size-4 text-muted" strokeWidth={2} aria-hidden />
            )}
            <h2 className="font-display text-lg font-bold text-navy">Respuesta</h2>
          </div>

          <pre className="mt-4 overflow-auto idp-radius-md rounded-md border border-border bg-surface p-4 font-mono text-xs leading-6 text-navy">
            {responseBody}
          </pre>
        </section>
      </main>
    </div>
  );
}
