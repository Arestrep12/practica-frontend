import type { DeploymentStatus } from "@/lib/mock-projects";
import { deploymentStatusLabels } from "@/lib/mock-projects";

const statusStyles: Record<DeploymentStatus, { dot: string; text: string; bg: string }> = {
  active: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  building: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  deploying: { dot: "bg-blue-accent", text: "text-blue-accent", bg: "bg-blue-light" },
  pending: { dot: "bg-muted", text: "text-muted", bg: "bg-surface" },
  error: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
  stopped: { dot: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-100" },
};

export function StatusBadge({ status }: { status: DeploymentStatus }) {
  const style = statusStyles[status];
  const animate = status === "building" || status === "deploying" || status === "pending";

  return (
    <span
      className={`inline-flex items-center gap-1.5 idp-radius-md rounded-md px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}
    >
      <span
        className={`size-1.5 rounded-full ${style.dot} ${animate ? "animate-pulse" : ""}`}
        aria-hidden
      />
      {deploymentStatusLabels[status]}
    </span>
  );
}
