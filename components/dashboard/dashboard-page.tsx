"use client";

import { ProjectCard } from "@/components/dashboard/project-card";
import { mockProjects } from "@/lib/mock-projects";
import { Filter, LayoutGrid, List, Rocket, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type ViewMode = "grid" | "list";
type SortOption = "activity" | "name";

export function DashboardPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("activity");
  const [view, setView] = useState<ViewMode>("grid");

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = mockProjects.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.repository.toLowerCase().includes(q) ||
        p.url.toLowerCase().includes(q),
    );

    if (sort === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));
    }

    return list;
  }, [query, sort]);

  return (
    <div className="min-h-screen bg-white text-navy">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Link href="/" className="font-display text-lg font-bold tracking-tight">
            IDP
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar repositorios y proyectos..."
              className="w-full idp-radius-md rounded-md border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-navy outline-none transition-colors placeholder:text-muted focus:border-blue-accent"
            />
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <label className="relative flex h-10 w-10 items-center justify-center">
              <span className="sr-only">Ordenar proyectos</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                <option value="activity">Ordenar por actividad</option>
                <option value="name">Ordenar por nombre</option>
              </select>
              <span className="pointer-events-none flex h-10 w-10 items-center justify-center idp-radius-md rounded-md border border-border bg-white text-muted">
                <Filter className="size-4" strokeWidth={2} aria-hidden />
              </span>
            </label>

            <div className="flex items-center idp-radius-md overflow-hidden rounded-md border border-border">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`flex h-10 w-10 items-center justify-center transition-colors ${
                  view === "grid" ? "bg-surface" : "bg-white hover:bg-surface"
                }`}
                aria-label="Vista en cuadrícula"
                aria-pressed={view === "grid"}
              >
                <LayoutGrid
                  className={`size-4 ${view === "grid" ? "text-navy" : "text-muted"}`}
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`flex h-10 w-10 items-center justify-center border-l border-border transition-colors ${
                  view === "list" ? "bg-surface" : "bg-white hover:bg-surface"
                }`}
                aria-label="Vista en lista"
                aria-pressed={view === "list"}
              >
                <List
                  className={`size-4 ${view === "list" ? "text-navy" : "text-muted"}`}
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
            </div>

            <button
              type="button"
              aria-label="Agregar nuevo proyecto"
              className="inline-flex h-10 w-10 items-center justify-center idp-radius-md rounded-md bg-navy text-white transition-colors hover:bg-navy-deep"
            >
              <Rocket className="size-[18px]" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <p className="mt-16 text-center text-muted">
            No hay proyectos que coincidan con tu búsqueda.
          </p>
        ) : (
          <div
            className={
              view === "grid"
                ? "mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "mt-8 flex flex-col gap-3"
            }
          >
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
