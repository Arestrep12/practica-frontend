import { LoginPage } from "@/components/auth/login-page";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { LandingPage } from "@/components/landing/landing-page";
import { ProjectDetail } from "@/components/projects/project-detail";
import { RuntimeLogDetail } from "@/components/projects/runtime-log-detail";
import { getProjectById } from "@/lib/mock-projects";
import { getRuntimeLogById } from "@/lib/mock-runtime-logs";
import { useEffect } from "react";
import { Link, Route, Routes, useParams } from "react-router-dom";

const defaultDescription =
  "Plataforma de deploy interno para productos de la empresa. Una experiencia simple, profesional y unificada.";

function PageMeta({
  title,
  description = defaultDescription,
}: {
  title: string;
  description?: string;
}) {
  useEffect(() => {
    document.title = title;

    let meta = document.querySelector<HTMLMetaElement>("meta[name='description']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.append(meta);
    }
    meta.content = description;
  }, [description, title]);

  return null;
}

function HomeRoute() {
  return (
    <>
      <PageMeta title="IDP - Deploy interno en AWS" />
      <LandingPage />
    </>
  );
}

function LoginRoute() {
  return (
    <>
      <PageMeta title="Iniciar sesión - IDP" description="Acceso a Internal Deploy Platform." />
      <LoginPage />
    </>
  );
}

function DashboardRoute() {
  return (
    <>
      <PageMeta title="Proyectos - IDP" description="Dashboard de proyectos desplegados en AWS interno." />
      <DashboardPage />
    </>
  );
}

function ProjectRoute() {
  const { id } = useParams<{ id: string }>();
  const project = id ? getProjectById(id) : null;

  if (!project) {
    return <NotFoundRoute />;
  }

  return (
    <>
      <PageMeta
        title={`${project.name} - IDP`}
        description={`Overview, deployments y configuración de ${project.name}.`}
      />
      <ProjectDetail project={project} />
    </>
  );
}

function RuntimeLogRoute() {
  const { id, logId } = useParams<{ id: string; logId: string }>();
  const project = id ? getProjectById(id) : null;
  const log = project && logId ? getRuntimeLogById(project, logId) : null;

  if (!project || !log) {
    return <NotFoundRoute />;
  }

  return (
    <>
      <PageMeta
        title={`${log.statusCode} ${log.method} ${log.path} - IDP`}
        description={`Detalle del log ${log.id} de ${project.name}.`}
      />
      <RuntimeLogDetail project={project} log={log} />
    </>
  );
}

function NotFoundRoute() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-navy">
      <PageMeta
        title="Página no encontrada - IDP"
        description="La página solicitada no existe."
      />
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted">404</p>
        <h1 className="font-display mt-3 text-3xl font-bold">Página no encontrada</h1>
        <p className="mt-3 text-sm text-muted">
          La ruta solicitada no existe o el proyecto ya no está disponible.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex h-10 items-center idp-radius-md rounded-md bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
        >
          Volver al dashboard
        </Link>
      </div>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/dashboard" element={<DashboardRoute />} />
      <Route path="/projects/:id" element={<ProjectRoute />} />
      <Route path="/projects/:id/logs/:logId" element={<RuntimeLogRoute />} />
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
}
