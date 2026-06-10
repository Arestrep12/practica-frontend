export type ProjectStatus = "active" | "warning" | "error";

export type DeploymentStatus =
  | "pending"
  | "building"
  | "deploying"
  | "active"
  | "error"
  | "stopped";

export type Deployment = {
  id: string;
  environment: "staging" | "prod-interno";
  status: DeploymentStatus;
  commitSha: string;
  commitMessage: string;
  branch: string;
  author: string;
  createdAt: string;
  /** ISO local timestamp del deployment, para filtros de fecha/hora. */
  timestamp: string;
  durationMs: number | null;
};

export type EnvVar = {
  key: string;
  value: string;
  environment: "staging" | "prod-interno" | "todos";
};

export type Member = {
  name: string;
  email: string;
  role: "Owner" | "Editor" | "Viewer";
};

export type Project = {
  id: string;
  name: string;
  url: string;
  repository: string;
  commitMessage: string;
  branch: string;
  updatedAt: string;
  status: ProjectStatus;
  runtime: string;
  environment: "staging" | "prod-interno";
  deployments: Deployment[];
  envVars: EnvVar[];
  members: Member[];
};

const baseEnvVars: EnvVar[] = [
  { key: "NODE_ENV", value: "production", environment: "todos" },
  { key: "LOG_LEVEL", value: "info", environment: "todos" },
  { key: "DATABASE_URL", value: "postgres://••••••••@db.internal:5432", environment: "prod-interno" },
  { key: "FEATURE_FLAGS", value: "beta-ui,fast-deploy", environment: "staging" },
];

const baseMembers: Member[] = [
  { name: "María Restrepo", email: "maria.restrepo@company.com", role: "Owner" },
  { name: "Andrés Gómez", email: "andres.gomez@company.com", role: "Editor" },
  { name: "Equipo Plataforma", email: "plataforma@company.com", role: "Viewer" },
];

function buildDeployments(branch: string, status: ProjectStatus): Deployment[] {
  const head: Deployment = {
    id: "dpl_9f3a2c",
    environment: "prod-interno",
    status: status === "active" ? "active" : status === "warning" ? "active" : "error",
    commitSha: "9f3a2c1",
    commitMessage: "Mejorar prompt de escalado",
    branch,
    author: "María Restrepo",
    createdAt: "Hace 2 h",
    timestamp: "2026-05-28T14:05:00",
    durationMs: 84_000,
  };

  return [
    head,
    {
      id: "dpl_7b1e44",
      environment: "staging",
      status: "active",
      commitSha: "7b1e44d",
      commitMessage: "Ajustar timeout de health check",
      branch,
      author: "Andrés Gómez",
      createdAt: "Hace 6 h",
      timestamp: "2026-05-28T09:42:00",
      durationMs: 72_000,
    },
    {
      id: "dpl_5c0d18",
      environment: "prod-interno",
      status: "stopped",
      commitSha: "5c0d18a",
      commitMessage: "Rollback de release inestable",
      branch,
      author: "María Restrepo",
      createdAt: "Hace 1 d",
      timestamp: "2026-05-27T16:20:00",
      durationMs: 91_000,
    },
    {
      id: "dpl_2a9f07",
      environment: "staging",
      status: "error",
      commitSha: "2a9f07e",
      commitMessage: "Probar nueva config de memoria",
      branch,
      author: "Andrés Gómez",
      createdAt: "Hace 2 d",
      timestamp: "2026-05-26T11:08:00",
      durationMs: 38_000,
    },
  ];
}

type ProjectSeed = Omit<
  Project,
  "runtime" | "environment" | "deployments" | "envVars" | "members"
> & {
  runtime: string;
  environment: "staging" | "prod-interno";
};

const projectSeeds: ProjectSeed[] = [
  {
    id: "1",
    name: "agente-soporte-ia",
    url: "agente-soporte-ia.internal.company",
    repository: "plataforma/agente-soporte-ia",
    commitMessage: "Mejorar prompt de escalado",
    branch: "main",
    updatedAt: "Hace 2 h",
    status: "active",
    runtime: "python-agent",
    environment: "prod-interno",
  },
  {
    id: "2",
    name: "portal-rrhh",
    url: "portal-rrhh-staging.internal.company",
    repository: "hr/portal-rrhh",
    commitMessage: "Fix validación de formularios",
    branch: "main",
    updatedAt: "Hace 1 d",
    status: "active",
    runtime: "node-api",
    environment: "staging",
  },
  {
    id: "3",
    name: "api-inventario",
    url: "api-inventario.internal.company",
    repository: "logistica/api-inventario",
    commitMessage: "Bump dependencias de seguridad",
    branch: "release/2.4",
    updatedAt: "Hace 3 d",
    status: "warning",
    runtime: "node-api",
    environment: "prod-interno",
  },
  {
    id: "4",
    name: "dashboard-metricas",
    url: "metricas.internal.company",
    repository: "data/dashboard-metricas",
    commitMessage: "Añadir gráfico de deploys",
    branch: "main",
    updatedAt: "Hace 5 d",
    status: "active",
    runtime: "next-static",
    environment: "prod-interno",
  },
  {
    id: "5",
    name: "webhook-pagos",
    url: "webhook-pagos.internal.company",
    repository: "finanzas/webhook-pagos",
    commitMessage: "Timeout en handler Lambda",
    branch: "hotfix/timeout",
    updatedAt: "Hace 1 sem",
    status: "error",
    runtime: "python-agent",
    environment: "prod-interno",
  },
  {
    id: "6",
    name: "docs-internos",
    url: "docs.internal.company",
    repository: "platform/docs-internos",
    commitMessage: "Actualizar guía de onboarding",
    branch: "main",
    updatedAt: "Hace 2 sem",
    status: "active",
    runtime: "next-static",
    environment: "prod-interno",
  },
];

export const mockProjects: Project[] = projectSeeds.map((seed) => ({
  ...seed,
  deployments: buildDeployments(seed.branch, seed.status),
  envVars: baseEnvVars,
  members: baseMembers,
}));

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((project) => project.id === id);
}

export const runtimeLabels: Record<string, string> = {
  "next-static": "Sitio estático (S3 + CloudFront)",
  "node-api": "Contenedor Node (ECS Fargate)",
  "python-agent": "Agente Python (Lambda)",
};

export const deploymentStatusLabels: Record<DeploymentStatus, string> = {
  pending: "Pendiente",
  building: "Construyendo",
  deploying: "Desplegando",
  active: "Activo",
  error: "Error",
  stopped: "Detenido",
};
