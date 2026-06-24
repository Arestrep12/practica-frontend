import { StatusBadge } from "@/components/ui/status-badge";
import type { Deployment, Project } from "@/lib/mock-projects";
import { ChevronRight, Clock, Copy, GitBranch } from "lucide-react";

function buildPreviewLogs(deployment: Deployment): string[] {
  return [
    `[00:00] Iniciando deployment ${deployment.id}`,
    `[00:02] Clonando ${deployment.branch} @ ${deployment.commitSha}`,
    "[00:51] Build completado",
    deployment.status === "error"
      ? "[01:04] ERROR: health check falló tras 30s"
      : "[01:12] Deployment finalizado correctamente",
  ];
}

function logLineClass(line: string): string {
  if (line.includes("ERROR")) return "text-red-400";
  if (line.includes("correctamente")) return "text-emerald-300";
  return "text-blue-light/90";
}

type DeploymentsPreviewProps = {
  project: Project;
  /** Deployment seleccionado en el panel derecho (por defecto el primero) */
  selectedIndex?: number;
};

export function DeploymentsPreview({ project, selectedIndex = 0 }: DeploymentsPreviewProps) {
  const deployments = project.deployments.slice(0, 3);
  const selected = deployments[selectedIndex] ?? deployments[0];
  const logs = buildPreviewLogs(selected);

  return (
    <div className="bg-white p-4 text-navy md:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Deployments</p>
      <div className="mt-3 grid gap-3 lg:grid-cols-5">
        <ul className="lg:col-span-3 idp-radius-md overflow-hidden rounded-md border border-border">
          {deployments.map((d, i) => (
            <li
              key={d.id}
              className={`flex items-center gap-3 px-3 py-2.5 ${
                i > 0 ? "border-t border-border" : ""
              } ${i === selectedIndex ? "bg-surface" : "bg-white"}`}
            >
              <StatusBadge status={d.status} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-navy">{d.commitMessage}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-muted">
                  <code className="font-mono">{d.commitSha}</code>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-0.5">
                    <GitBranch className="size-2.5" strokeWidth={2} aria-hidden />
                    {d.branch}
                  </span>
                  <span aria-hidden>·</span>
                  <span>{d.createdAt}</span>
                </div>
              </div>
              <ChevronRight
                className={`size-3.5 shrink-0 ${i === selectedIndex ? "text-navy" : "text-border"}`}
                strokeWidth={2}
                aria-hidden
              />
            </li>
          ))}
        </ul>

        <div className="lg:col-span-2 idp-radius-md rounded-md border border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display text-xs font-bold text-navy">Detalle</p>
            <StatusBadge status={selected.status} />
          </div>
          <dl className="mt-2 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted">Commit</dt>
              <dd className="flex items-center gap-0.5">
                <code className="font-mono text-[10px]">{selected.commitSha}</code>
                <Copy className="size-3 text-muted opacity-50" strokeWidth={2} aria-hidden />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted">Duración</dt>
              <dd className="inline-flex items-center gap-1 text-navy">
                <Clock className="size-3 text-muted" strokeWidth={2} aria-hidden />
                {selected.durationMs ? `${Math.round(selected.durationMs / 1000)}s` : "—"}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted">Logs</p>
          <pre className="mt-1.5 max-h-28 overflow-hidden idp-radius-sm rounded-sm bg-navy-deep p-2 font-mono text-[9px] leading-relaxed">
            {logs.map((line, i) => (
              <div key={i} className={logLineClass(line)}>
                {line}
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}
