import type { Project } from "@/lib/mock-projects";
import {
  CircleX,
  EllipsisVertical,
  GitBranch,
  GitFork,
  ThumbsUp,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

function StatusIndicator({ status }: { status: Project["status"] }) {
  if (status === "active") {
    return (
      <span title="Activo">
        <ThumbsUp
          className="size-[18px] fill-emerald-600 text-emerald-600"
          strokeWidth={1.75}
          aria-hidden
        />
      </span>
    );
  }

  if (status === "warning") {
    return (
      <span title="Advertencia">
        <TriangleAlert className="size-4 text-amber-500" strokeWidth={2} aria-hidden />
      </span>
    );
  }

  return (
    <span title="Error">
      <CircleX className="size-4 text-red-500" strokeWidth={2} aria-hidden />
    </span>
  );
}

function MoreMenu() {
  return (
    <button
      type="button"
      className="relative z-10 rounded p-1 text-muted transition-colors hover:bg-surface hover:text-navy"
      aria-label="Opciones del proyecto"
    >
      <EllipsisVertical className="size-4" strokeWidth={2} aria-hidden />
    </button>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group relative idp-radius-lg flex flex-col rounded-lg border border-border bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-1">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center idp-radius-md rounded-md border border-border bg-surface text-xs font-semibold text-muted"
          aria-hidden
        >
          {project.name.slice(0, 2).toUpperCase()}
        </div>
        <MoreMenu />
      </div>

      <div className="flex items-center gap-5 pr-24">
        <div className="flex shrink-0 pt-1">
          <StatusIndicator status={project.status} />
        </div>
        <div className="min-w-0 flex-1 pl-1">
          <Link
            href={`/projects/${project.id}`}
            className="block truncate font-semibold text-navy transition-colors before:absolute before:inset-0 before:z-0 before:content-[''] group-hover:text-blue-accent"
          >
            {project.name}
          </Link>
          <a
            href={`https://${project.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 mt-0.5 inline-block max-w-full truncate text-sm text-muted transition-colors hover:text-blue-accent"
          >
            {project.url}
          </a>
        </div>
      </div>

      <div className="mt-4">
        <span className="inline-flex max-w-full items-center gap-1.5 idp-radius-md rounded-md bg-surface px-2.5 py-1 text-xs text-muted">
          <GitFork className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
          <span className="truncate">{project.repository}</span>
        </span>
      </div>

      <p className="mt-4 truncate text-sm text-muted">{project.commitMessage}</p>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <GitBranch className="size-3 shrink-0" strokeWidth={2} aria-hidden />
          {project.branch}
        </span>
        <span aria-hidden>·</span>
        <span>
          {project.updatedAt} en {project.branch}
        </span>
      </div>
    </article>
  );
}
