import type { Project } from "@/lib/mock-projects";

export type RuntimeStatusFilter = "all" | "2xx" | "3xx" | "4xx" | "5xx";
export type RuntimeMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RuntimeLog = {
  id: string;
  timestamp: string;
  method: RuntimeMethod;
  path: string;
  statusCode: 200 | 201 | 204 | 301 | 302 | 400 | 401 | 403 | 404 | 409 | 429 | 500 | 502 | 503;
  latencyMs: number;
  source: string;
  traceId: string;
};

export const statusFilters: { id: RuntimeStatusFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "2xx", label: "2xx" },
  { id: "3xx", label: "3xx" },
  { id: "4xx", label: "4xx" },
  { id: "5xx", label: "5xx" },
];

const runtimeLogTemplates: Array<
  Pick<RuntimeLog, "method" | "path" | "statusCode" | "latencyMs" | "source">
> = [
  { method: "GET", path: "/api/health", statusCode: 200, latencyMs: 42, source: "alb-prod-a" },
  { method: "GET", path: "/dashboard", statusCode: 200, latencyMs: 118, source: "cloudfront" },
  { method: "POST", path: "/api/deployments", statusCode: 201, latencyMs: 286, source: "ecs-task-04" },
  { method: "GET", path: "/api/projects", statusCode: 200, latencyMs: 94, source: "ecs-task-02" },
  { method: "PATCH", path: "/api/projects/env", statusCode: 204, latencyMs: 173, source: "ecs-task-01" },
  { method: "GET", path: "/assets/app.css", statusCode: 200, latencyMs: 31, source: "cloudfront" },
  { method: "GET", path: "/api/deployments/latest", statusCode: 502, latencyMs: 823, source: "alb-prod-b" },
  { method: "POST", path: "/api/auth/session", statusCode: 401, latencyMs: 76, source: "ecs-task-03" },
  { method: "GET", path: "/api/logs/stream", statusCode: 200, latencyMs: 64, source: "ecs-task-02" },
  { method: "GET", path: "/api/projects/unknown", statusCode: 404, latencyMs: 58, source: "ecs-task-01" },
  { method: "POST", path: "/api/webhooks/git", statusCode: 500, latencyMs: 1_240, source: "lambda-webhook" },
  { method: "GET", path: "/api/metrics", statusCode: 429, latencyMs: 91, source: "alb-prod-a" },
];

const mockRuntimeBaseTime = new Date("2026-05-28T15:18:00").getTime();

export function buildRuntimeLogs(project: Project): RuntimeLog[] {
  return runtimeLogTemplates.map((template, index) => ({
    ...template,
    id: `${project.id}-req-${index}`,
    timestamp: new Date(mockRuntimeBaseTime - (runtimeLogTemplates.length - index) * 9_000).toISOString(),
    traceId: `trc_${project.id}_${(10_000 + index * 317).toString(16)}`,
  }));
}

export function getRuntimeLogById(project: Project, logId: string): RuntimeLog | undefined {
  return buildRuntimeLogs(project).find((log) => log.id === logId);
}

export function runtimeStatusBucket(statusCode: RuntimeLog["statusCode"]): RuntimeStatusFilter {
  if (statusCode >= 500) return "5xx";
  if (statusCode >= 400) return "4xx";
  if (statusCode >= 300) return "3xx";
  return "2xx";
}
