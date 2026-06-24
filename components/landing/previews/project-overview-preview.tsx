import { StatusBadge } from "@/components/ui/status-badge";
import type { Project } from "@/lib/mock-projects";
import { runtimeLabels } from "@/lib/mock-projects";
import {
  ChevronRight,
  ExternalLink,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  Globe,
  RotateCw,
  Server,
} from "lucide-react";

type ProjectOverviewPreviewProps = {
  project: Project;
  compact?: boolean;
};

export function ProjectOverviewPreview({ project, compact = false }: ProjectOverviewPreviewProps) {
  const latest = project.deployments[0];

  return (
    <div className={`bg-white text-navy ${compact ? "p-3" : "p-4 md:p-5"}`}>
      <div className="flex items-center gap-1.5 border-b border-border pb-3 text-[11px] text-muted">
        <span className="font-display font-bold text-navy">IDP</span>
        <ChevronRight className="size-3" strokeWidth={2} aria-hidden />
        <span>Proyectos</span>
        <ChevronRight className="size-3" strokeWidth={2} aria-hidden />
        <span className="truncate font-medium text-navy">{project.name}</span>
      </div>

      <div className={`flex flex-col gap-3 ${compact ? "mt-3" : "mt-4 sm:flex-row sm:items-start sm:justify-between"}`}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display truncate text-base font-bold text-navy">{project.name}</h3>
            <StatusBadge status={latest.status} />
          </div>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
            <Globe className="size-3" strokeWidth={2} aria-hidden />
            {project.url}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="inline-flex h-8 items-center gap-1.5 idp-radius-md rounded-md border border-border px-3 text-xs font-medium text-navy">
            <ExternalLink className="size-3" strokeWidth={2} aria-hidden />
            Visitar
          </div>
          <div className="inline-flex h-8 items-center gap-1.5 idp-radius-md rounded-md bg-navy px-3 text-xs font-semibold text-white">
            <RotateCw className="size-3" strokeWidth={2} aria-hidden />
            Redeploy
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-1 border-b border-border">
        {(["Overview", "Deployments", "Logs", "Settings"] as const).map((tab, i) => (
          <span
            key={tab}
            className={`-mb-px border-b-2 px-2.5 py-1.5 text-[11px] font-medium ${
              i === 0 ? "border-navy text-navy" : "border-transparent text-muted"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>

      <div className={`mt-3 grid gap-3 ${compact ? "" : "sm:grid-cols-5"}`}>
        <div className={`idp-radius-md rounded-md border border-border p-3 ${compact ? "" : "sm:col-span-3"}`}>
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-sm font-bold text-navy">Producción</p>
            <StatusBadge status={latest.status} />
          </div>
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-accent">
            <Globe className="size-3" strokeWidth={2} aria-hidden />
            {project.url}
          </p>
          <div className="mt-3 idp-radius-sm rounded-sm border border-border bg-surface p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
              Último deployment
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="inline-flex items-center gap-1 text-navy">
                <GitCommitHorizontal className="size-3 text-muted" strokeWidth={2} aria-hidden />
                <code className="font-mono text-[10px]">{latest.commitSha}</code>
              </span>
              <span className="text-navy">{latest.commitMessage}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[10px] text-muted">
              <span className="inline-flex items-center gap-0.5">
                <GitBranch className="size-2.5" strokeWidth={2} aria-hidden />
                {latest.branch}
              </span>
              <span aria-hidden>·</span>
              <span>{latest.author}</span>
              <span aria-hidden>·</span>
              <span>{latest.createdAt}</span>
            </div>
          </div>
        </div>

        <div className={`idp-radius-md rounded-md border border-border p-3 ${compact ? "mt-0" : "sm:col-span-2"}`}>
          <p className="font-display text-sm font-bold text-navy">Resumen</p>
          <dl className="mt-2 space-y-2 text-xs">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted">Runtime</dt>
              <dd className="mt-0.5 flex items-center gap-1 text-navy">
                <Server className="size-3 text-muted" strokeWidth={2} aria-hidden />
                {runtimeLabels[project.runtime] ?? project.runtime}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                Repositorio
              </dt>
              <dd className="mt-0.5 flex items-center gap-1 text-navy">
                <GitFork className="size-3 text-muted" strokeWidth={2} aria-hidden />
                <span className="truncate">{project.repository}</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
