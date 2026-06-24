import type { Project } from "@/lib/mock-projects";
import {
  CircleX,
  GitBranch,
  GitFork,
  LayoutGrid,
  Rocket,
  Search,
  ThumbsUp,
  TriangleAlert,
} from "lucide-react";

function ProjectStatusIcon({ status }: { status: Project["status"] }) {
  if (status === "active") {
    return (
      <ThumbsUp
        className="size-4 fill-emerald-600 text-emerald-600"
        strokeWidth={1.75}
        aria-hidden
      />
    );
  }
  if (status === "warning") {
    return <TriangleAlert className="size-3.5 text-amber-500" strokeWidth={2} aria-hidden />;
  }
  return <CircleX className="size-3.5 text-red-500" strokeWidth={2} aria-hidden />;
}

function PreviewProjectCard({ project, hero = false }: { project: Project; hero?: boolean }) {
  return (
    <div
      className={`flex h-full flex-col idp-radius-md rounded-md border border-border bg-white ${
        hero ? "p-3.5 md:p-4 lg:p-5" : "p-3.5"
      }`}
    >
      <div className={`flex items-start ${hero ? "gap-2.5 md:gap-3" : "gap-3"}`}>
        <div className="pt-0.5">
          <ProjectStatusIcon status={project.status} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate font-semibold text-navy ${hero ? "text-sm md:text-base" : "text-sm"}`}>
            {project.name}
          </p>
          <p className={`mt-0.5 truncate text-muted ${hero ? "text-xs md:text-sm" : "text-xs"}`}>
            {project.url}
          </p>
        </div>
        <div
          className={`flex shrink-0 items-center justify-center idp-radius-sm rounded-sm border border-border bg-surface font-semibold text-muted ${
            hero ? "size-9 text-[11px] md:size-10 md:text-xs" : "size-8 text-[10px]"
          }`}
          aria-hidden
        >
          {project.name.slice(0, 2).toUpperCase()}
        </div>
      </div>
      <div className={hero ? "mt-3 md:mt-4" : "mt-2.5"}>
        <span
          className={`inline-flex max-w-full items-center gap-1 idp-radius-sm rounded-sm bg-surface text-muted ${
            hero ? "px-2.5 py-1 text-[11px] md:text-xs" : "px-2 py-0.5 text-[10px]"
          }`}
        >
          <GitFork className="size-3 shrink-0" strokeWidth={2} aria-hidden />
          <span className="truncate">{project.repository}</span>
        </span>
      </div>
      <p
        className={`mt-2 text-muted ${hero ? "line-clamp-2 text-xs leading-snug md:text-sm" : "truncate text-xs"}`}
      >
        {project.commitMessage}
      </p>
      <div
        className={`mt-auto flex items-center gap-1.5 text-muted ${
          hero ? "pt-2 text-[11px] md:text-xs" : "mt-1 text-[10px]"
        }`}
      >
        <GitBranch className="size-2.5 shrink-0" strokeWidth={2} aria-hidden />
        <span>{project.branch}</span>
        <span aria-hidden>·</span>
        <span>{project.updatedAt}</span>
      </div>
    </div>
  );
}

type DashboardPreviewProps = {
  projects: Project[];
  compact?: boolean;
  /** Layout para viewport 16:9 del hero */
  hero?: boolean;
};

export function DashboardPreview({ projects, compact = false, hero = false }: DashboardPreviewProps) {
  const padding = hero ? "p-5 md:p-6 lg:p-8" : compact ? "p-3" : "p-4 md:p-5";

  return (
    <div className={`flex h-full flex-col bg-white text-navy ${padding}`}>
      <div className={`flex shrink-0 items-center gap-2 border-b border-border ${hero ? "pb-4 md:pb-5" : "pb-3"}`}>
        <span className={`font-display font-bold tracking-tight ${hero ? "text-base md:text-lg" : "text-sm"}`}>
          IDP
        </span>
      </div>

      <div
        className={`flex shrink-0 items-center gap-2 md:gap-3 ${
          hero ? "mt-4 md:mt-5 lg:mt-6" : compact ? "mt-3" : "mt-4"
        }`}
      >
        <div className="relative min-w-0 flex-1">
          <Search
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted ${
              hero ? "left-3 size-4 md:left-3.5" : "left-2.5 size-3.5"
            }`}
            strokeWidth={2}
            aria-hidden
          />
          <div
            className={`w-full idp-radius-md rounded-md border border-border bg-white text-muted ${
              hero
                ? "py-2.5 pl-10 pr-4 text-xs md:py-3 md:pl-11 md:text-sm"
                : "py-2 pl-8 pr-3 text-xs"
            }`}
          >
            Buscar repositorios y proyectos...
          </div>
        </div>
        <div
          className={`flex shrink-0 items-center justify-center idp-radius-md rounded-md border border-border bg-surface text-muted ${
            hero ? "size-9 md:size-10" : "size-8"
          }`}
          aria-hidden
        >
          <LayoutGrid className={hero ? "size-4" : "size-3.5"} strokeWidth={2} />
        </div>
        <div
          className={`flex shrink-0 items-center justify-center idp-radius-md rounded-md bg-navy text-white ${
            hero ? "size-9 md:size-10" : "size-8"
          }`}
          aria-hidden
        >
          <Rocket className={hero ? "size-4" : "size-3.5"} strokeWidth={2} />
        </div>
      </div>

      <div
        className={`min-h-0 flex-1 ${
          hero
            ? "mt-4 grid grid-cols-3 gap-3 md:mt-5 md:gap-4 lg:mt-6 lg:gap-5"
            : compact
              ? "mt-3 grid gap-2"
              : "mt-4 grid gap-2 sm:grid-cols-2"
        }`}
      >
        {projects.map((project) => (
          <PreviewProjectCard key={project.id} project={project} hero={hero} />
        ))}
      </div>
    </div>
  );
}
