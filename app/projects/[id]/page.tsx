import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";
import { getProjectById } from "@/lib/mock-projects";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);

  return {
    title: project ? `${project.name} — IDP` : "Proyecto no encontrado — IDP",
    description: project
      ? `Overview, deployments y configuración de ${project.name}.`
      : "El proyecto solicitado no existe.",
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return <ProjectDetail project={project} />;
}
