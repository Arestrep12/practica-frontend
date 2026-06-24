# AGENTS.md — Plataforma de Deploy Interno

Guía para agentes de IA (Cursor, Cloud Agents, etc.) que trabajen en este repositorio.

## Visión del producto

**Nombre de trabajo:** Internal Deploy Platform (IDP)

Plataforma web **al estilo Vercel**, **exclusivamente para desplegar** productos internos de la empresa en AWS. Una sola experiencia — simple, general y usable — para perfiles no técnicos y técnicos por igual: mismas pantallas, mismo flujo, misma densidad de información.

Referencia de producto: [Vercel](https://vercel.com) (dashboard de proyectos, lista de deployments, variables de entorno, logs en el detalle del deploy, botón de redeploy). No copiar su alcance de *creación* de apps; sí su claridad operativa.

### Audiencia (un solo producto)

- **No técnico** — necesita publicar sin aprender ECS, Lambda ni la consola AWS.
- **Técnico** — quiere la misma simplicidad para POCs y shippings frecuentes; profundiza solo donde haga falta (logs, SHA, variables), sin cambiar de “modo” ni de interfaz.

El valor para todos: **menos fricción hasta una URL interna funcionando**, no “crear la app”.

### Qué resuelve

- Conectar un proyecto existente (repo, imagen o artefacto) y publicarlo en AWS interno.
- Ver deployments, URL, logs y rollback desde un único dashboard.
- Re-desplegar en un clic, como en Vercel, sin bifurcar flujos por tipo de usuario.
- Estandarizar el camino a producción interno sin depender de DevOps en cada shipping.

### Qué NO es (límites estrictos)

| Fuera de alcance | Por qué |
|------------------|---------|
| Crear apps desde cero (scaffolding, templates, “New Project” tipo Vercel) | No es un IDE ni un generador de productos |
| Editor de código, CI builder visual, diseño de agentes | Solo **deploy** de lo que ya existe |
| Hosting multi-cloud | Solo **AWS** (cuenta/organización interna) |
| Marketplace público o deploy externo | Solo productos **internos** |

Si una petición implica “crear una app nueva”, redirigir mentalmente al repositorio del producto; esta app solo orquesta el deploy.

---

## Usuarios y experiencia

### Personas (misma UI para todas)

1. **Product Owner / negocio** — entra al dashboard del proyecto y ve si está en vivo y la URL.
2. **Maker de IA** — importa repo o imagen y publica sin documentación de AWS.
3. **Ingeniero / desarrollador interno** — usa **las mismas pantallas**; abre logs y variables en el proyecto cuando lo necesita, sin una “vista alternativa”.
4. **DevOps / plataforma** — configura `RuntimeProfile`s y cuotas; no es el usuario principal del día a día.

### Experiencia única (modelo Vercel)

**No** implementar modos, toggles “simple/rápido”, wizards paralelos ni rutas duplicadas (`/deploy/quick` vs `/deploy/guided`). **Sí** una jerarquía de navegación clara:

```
Dashboard → Proyecto → [Overview | Deployments | Settings]
                              └─ Detalle de un Deployment (logs, estado)
```

| Pantalla | Qué muestra (todos los perfiles) |
|----------|----------------------------------|
| **Dashboard** | Lista de proyectos; CTA “Nuevo proyecto”; estado del último deploy por proyecto |
| **Nuevo proyecto** | Nombre, origen (repo / imagen / zip), runtime (lista cerrada), entorno inicial — un formulario, campos mínimos |
| **Overview del proyecto** | URL activa, botón **Publicar** / **Redeploy**, último deployment, acceso rápido a settings |
| **Deployments** | Historial cronológico (como Vercel); clic abre detalle con logs y commit/ref |
| **Settings** | Variables de entorno, rama por defecto, runtime (solo lectura tras crear si aplica política), miembros/equipo |

**Progressive disclosure:** lo avanzado vive en **Settings** y en el **detalle del deployment** (logs completos, IDs internos copiables), no en un segundo producto. El usuario técnico no recibe atajos exclusivos; recibe la misma UI con información suficiente para iterar rápido (redeploy visible, historial denso).

### Principios de UX (obligatorios)

- **Un flujo, una vocabulario:** español claro en labels principales; términos técnicos solo donde aportan (ej. “Commit”, “Logs”) con tooltip breve — igual para todos.
- **Simplicidad por defecto:** crear proyecto y primer deploy en **un formulario + Publicar**; siguientes deploys desde Overview en **un clic** (misma config que el último exitoso, salvo cambios en Settings).
- Estados unificados: `Pendiente`, `Construyendo`, `Desplegando`, `Activo`, `Error`, `Detenido`.
- Errores en lenguaje humano en la UI principal; logs crudos **solo** en la vista de detalle del deployment (como Vercel), no como “modo técnico”.
- Confirmaciones explícitas para destructivas (eliminar proyecto/entorno, rollback).
- **POC del ingeniero:** mismo formulario “Nuevo proyecto”; equipo y metadatos opcionales con defaults — no un flujo especial.
- **Prohibido para agentes:** `viewMode`, `guidedMode`, `quickDeploy`, rutas o componentes duplicados por perfil de usuario.

---

## Stack técnico

| Capa | Elección | Notas |
|------|----------|-------|
| Runtime / package manager | **Bun** | `bun install`, `bun run dev` |
| Frontend | **Vite + React** | SPA con React Router; consume backend separado |
| Auth | Por definir (SSO corporativo recomendado) | Todo deploy atado a identidad |
| Backend de orquestación | API propia en el monorepo o servicio separado | Encapsula AWS; la UI nunca llama AWS directo desde el browser |
| Infra objetivo | **AWS** | ECS/Fargate, Lambda, S3+CloudFront, ALB — según tipo de artefacto |
| Estado / colas | Por definir (ej. Postgres + cola de jobs) | Historial de deploys, idempotencia |
| IaC | CDK o Terraform en repo de plataforma | Cambios de infra revisados por PR, no clicks sueltos |

### Backend y provisión de infraestructura

El backend de esta plataforma no debe modelarse como un “macro servidor” donde viven todos los productos desplegados, ni como una automatización de wizards manuales de AWS. Debe separarse en dos planos:

| Plano | Responsabilidad | Ejemplos |
|-------|-----------------|----------|
| **Control Plane** | Plataforma interna que recibe intención de usuario, valida permisos, guarda estado y orquesta deployments | Frontend Vite, API de orquestación, base de datos, workers, auditoría |
| **Runtime Plane** | Recursos AWS donde corren los productos internos publicados | S3+CloudFront, ECS Fargate, Lambda, ALB, Route 53, CloudWatch |

La plataforma compartida es el **Control Plane**. Los proyectos publicados deben tener recursos de ejecución propios o lógicamente aislados según el `RuntimeProfile`. Por ejemplo: un cluster ECS puede ser compartido, pero cada proyecto debe tener su propio ECS Service, Task Definition, Target Group, Log Group y permisos mínimos.

No usar la consola o wizard de AWS como mecanismo operativo de deploy. AWS se debe consumir mediante APIs, workflows e infraestructura como código:

| Necesidad | Tecnología recomendada | Notas |
|-----------|------------------------|-------|
| Lenguaje principal | **TypeScript** | Mismo lenguaje para UI, backend e IaC si se usa CDK |
| Backend API / Orchestrator | Node.js + TypeScript | Servicio separado del frontend; puede vivir en `server/` si el monorepo lo requiere |
| Framework backend | Hono, Fastify o NestJS | Elegir uno; evitar duplicar patrones |
| Base de datos | PostgreSQL en RDS/Aurora | Recomendado para relaciones, auditoría, historial y RBAC |
| Workflows de deploy | AWS Step Functions | Coordina jobs largos: build, provisionamiento, publicación, rollback |
| Cola/eventos | SQS + EventBridge | Para desacoplar tareas, retries y eventos internos |
| Infraestructura como código | AWS CDK con TypeScript o Terraform | CDK si se prioriza TypeScript; Terraform si ya es estándar del banco |
| SDK cloud | AWS SDK for JavaScript/TypeScript | Llamadas controladas desde servidor, nunca desde el browser |
| Builds | AWS CodeBuild | Compila repos, genera artefactos o imágenes |
| Contenedores | ECR + ECS Fargate + ALB | Runtime recomendado para APIs y servicios web internos |
| Sitios estáticos | S3 + CloudFront | Primer runtime sugerido para MVP |
| Funciones | Lambda + API Gateway o ALB | Para webhooks, agentes ligeros o procesos pequeños |
| Logs | CloudWatch Logs | Agregar por `deploymentId`; mostrar logs crudos solo en detalle del deployment |
| Secretos/config | Secrets Manager + SSM Parameter Store | Nunca persistir secretos en DB ni exponerlos completos en respuestas API |
| DNS/TLS interno | Route 53 + ACM | URLs internas estables por entorno/proyecto |

Flujo esperado al publicar:

```
Usuario hace clic en Publicar
        │
        ▼
POST /projects/:id/deployments
        │
        ▼
Deploy Orchestrator valida auth/RBAC/cuotas
        │
        ▼
Crea Deployment en DB con estado Pendiente
        │
        ▼
Inicia workflow en Step Functions
        │
        ├─ CodeBuild compila repo/artefacto
        ├─ CDK/Terraform/SDK crea o actualiza recursos AWS
        ├─ S3/ECS/Lambda publica la nueva versión
        ├─ Route 53/ALB/CloudFront apunta la URL interna
        ├─ CloudWatch expone logs por deployment
        └─ DB marca Activo o Error
```

Modelos de aislamiento aceptados:

| Modelo | Uso recomendado | Tradeoff |
|--------|-----------------|----------|
| Recursos base compartidos | MVP y equipos internos confiables | Menor costo y menor complejidad; requiere buena separación lógica |
| Recursos dedicados por proyecto | Servicios con más criticidad o requisitos propios | Más aislamiento; mayor costo y administración |
| Cuenta AWS separada por equipo/proyecto | Entornos enterprise maduros con AWS Organizations | Aislamiento fuerte; demasiado complejo para MVP |

Para el MVP, preferir: **Control Plane compartido + Runtime Plane con recursos por proyecto donde importe el aislamiento**. Ejemplo: ALB y cluster ECS compartidos, pero ECS Service, Task Definition, Target Group, Log Group, variables y permisos separados por proyecto.

---

## Arquitectura de referencia

```
┌─────────────────────────────────────────────────────────────┐
│  Vite + React (UI)                                          │
│  - Dashboard → Proyecto → Deployments / Settings            │
│  - Un solo flujo de alta y de redeploy                      │
│  - (Futuro) CLI opcional sobre la misma API REST            │
└──────────────────────────┬──────────────────────────────────┘
                           │ API interna (auth obligatoria)
┌──────────────────────────▼──────────────────────────────────┐
│  Deploy Orchestrator                                        │
│  - Valida permisos y cuotas                                  │
│  - Encola jobs de deploy / rollback                          │
│  - Persiste releases y metadata                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  AWS (cuenta interna)                                        │
│  - Build (CodeBuild / pipeline) → artefacto                  │
│  - Runtime (ECS / Lambda / static)                           │
│  - DNS interno + TLS corporativo                             │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de deploy (MVP conceptual — único)

1. **Nuevo proyecto:** nombre + origen (repo Git interno / imagen ECR / zip) + `RuntimeProfile` + entorno inicial (`staging` por defecto).
2. **Publicar** → job asíncrono → la UI navega al detalle del deployment (polling o SSE).
3. Al **Activo:** URL en Overview; el historial queda en Deployments.
4. **Iteración:** desde Overview, **Redeploy** (misma rama/config) o cambio de variables en Settings → Publicar de nuevo.
5. **Rollback** desde el detalle de un deployment anterior o acción explícita “Revertir a esta versión”.

Mismo flujo para PO, maker e ingeniero; la diferencia es cuánto usan Settings y logs, no qué pantallas existen.

---

## Modelo de dominio (vocabulario del código)

Usar estos términos de forma consistente en tipos, tablas y UI:

- **Project** — un producto interno desplegable (metadatos, equipo, permisos).
- **Environment** — instancia lógica (`staging`, `prod-interno`); no confundir con “crear app”.
- **Release** — snapshot desplegable (commit SHA, digest de imagen, timestamp).
- **Deployment** — intento concreto de llevar un Release a un Environment (estado, logs).
- **RuntimeProfile** — plantilla AWS preaprobada (ej. `next-static`, `node-api`, `python-agent`).

No introducir entidades tipo `AppTemplate`, `Scaffold`, `Blueprint` salvo que el usuario cambie explícitamente el alcance.

---

## Seguridad y gobernanza

- **Autenticación obligatoria** en todas las rutas y APIs públicas del producto.
- Autorización por **equipo/proyecto** (RBAC); un usuario no lista deploys ajenos.
- Secretos solo vía almacén (Secrets Manager / SSM); nunca en logs ni en respuestas API completas.
- Principio de mínimo privilegio en roles IAM del orchestrator (un rol por acción, no `AdministratorAccess`).
- Auditoría: quién desplegó qué y cuándo (retención según política interna).
- Validar entradas en servidor (Zod o equivalente) en cada endpoint o handler del backend.

---

## Convenciones de repositorio

```
/
├── AGENTS.md              # Este archivo (+ reglas del frontend Vite arriba)
├── src/                   # Entrada Vite, router y estilos globales
├── components/            # UI reutilizable
├── lib/                   # Clientes API, utilidades, tipos compartidos
├── server/                # Lógica de orquestación si vive en este monorepo
├── infra/                 # CDK/Terraform para la plataforma (no por proyecto usuario)
└── docs/                  # Decisiones de arquitectura (ADR) opcional
```

### Estilo de código

- TypeScript estricto; sin `any` salvo justificación en comentario.
- Componentes React funcionales; hooks para lógica reutilizable.
- Consumir datos desde el backend de orquestación; mutaciones vía API del backend.
- Nombres en inglés en código; copy de UI en español.
- Cambios pequeños y enfocados; no expandir alcance a “creación de apps”.

### Qué priorizar en cada PR

1. ¿Un usuario no técnico y uno técnico pueden completar la misma tarea sin instrucciones distintas?
2. ¿Reduce fricción para desplegar algo que **ya existe**?
3. ¿Mantiene AWS detrás de una API controlada?
4. ¿Evita duplicar UI o rutas “por perfil”?
5. ¿Redeploy y logs están donde Vercel los pondría (Overview / detalle de deployment)?

---

## Integración AWS (directrices para agentes)

- La UI **no** embebe credenciales AWS ni SDK en el cliente.
- Toda llamada AWS vive en servidor (orchestrator) con credenciales de rol asumido.
- Empezar con **perfiles de runtime acotados** (2–3 tipos) en lugar de “cualquier cosa en AWS”.
- Logs: agregar por `deploymentId`; enlazar desde la UI sin exponer ARNs crudos por defecto.
- Costes y tags: aplicar tags estándar (`project`, `environment`, `owner`, `managed-by=idp`).

### Runtimes sugeridos para MVP (orden sugerido)

1. **Sitio estático** — build/export o artefacto → S3 + CloudFront.
2. **Contenedor** — imagen en ECR → ECS Fargate detrás de ALB.
3. **Función** — zip o imagen → Lambda (para agentes ligeros o webhooks).

Ampliar la lista solo con ADR o acuerdo explícito del usuario.

---

## API y contratos (borrador)

Endpoints conceptuales (implementar con nombres REST o tRPC según se elija):

- `GET /projects` — listar proyectos del usuario/equipo.
- `POST /projects` — registrar proyecto existente (metadata + origen).
- `POST /projects/:id/deployments` — iniciar deploy.
- `GET /deployments/:id` — estado y logs resumidos.
- `POST /deployments/:id/rollback` — volver a release anterior.
- `GET /deployments/:id/logs` — stream o paginado de logs (misma forma para UI y futura CLI).

Respuestas incluyen `status` (enum de UI), `message` humano y, en detalle de deployment, campos técnicos (`commitSha`, `buildId`, `durationMs`) **en el mismo payload** — sin negociar “modo” por cabecera ni preferencia de usuario.

---

## Testing y calidad

- Tests unitarios en lógica de orquestación y validación.
- Tests de integración con AWS mockeado o LocalStack donde aplique.
- E2E crítico: flujo feliz deploy + visualización de error simulado.
- No mergear UI que muestre secretos en pantalla o en network tab.

---

## Decisiones abiertas (documentar al resolver)

Marcar en `docs/adr/` cuando se cierre cada una:

- [ ] Proveedor de auth (SSO: Okta, Entra, etc.)
- [ ] Origen de código (GitLab interno, GitHub Enterprise, solo upload)
- [ ] Motor de colas para jobs de deploy
- [ ] Estrategia DNS (subdominio `*.internal.company`)
- [ ] Límites por equipo (cuotas concurrentes, entornos máximos)
- [ ] CLI oficial (`idp deploy`) — post-MVP; mismos endpoints que la UI, sin atajos de API exclusivos

---

## Instrucciones operativas para el agente

1. **Leer este archivo** antes de implementar features.
2. Ante ambigüedad, preguntar: “¿Es deploy de algo existente o creación de app?” — si es creación, **no** implementar aquí.
3. Preferir MVP vertical (un tipo de runtime de punta a punta) antes de abanico de features.
4. Responder al usuario en **español**; código y commits pueden estar en inglés.
5. No commitear sin pedido explícito; no incluir `.env` ni claves.
6. Al añadir dependencias AWS o de auth, documentar variables de entorno en `.env.example` sin valores reales.
7. Usar **Bun** para scripts (`bun run dev`, `bun install`); no cambiar a npm/pnpm sin pedido explícito.

---

## Glosario rápido (UI)

| Término UI | Significado |
|------------|-------------|
| Proyecto | Producto interno ya existente que se puede desplegar |
| Entorno | Staging o producción interna (misma app, distinta URL/config) |
| Despliegue | Un intento de publicación (ver progreso y logs) |
| Versión | Release concreto (commit o imagen) |
| Publicar | Iniciar un nuevo despliegue |
| Revertir | Rollback a la versión anterior estable |
| Redeploy | Volver a publicar con la misma configuración del proyecto |

---

## Contacto y contexto de prácticas

Proyecto de **prácticas profesionales**: priorizar demostración de valor (deploy real de un proyecto piloto interno) sobre perfección de plataforma multi-tenant el día uno.

**Éxito del MVP:** cualquier usuario (no técnico o técnico) crea un proyecto, publica, obtiene URL en Overview, revisa logs en el detalle del deployment y hace redeploy desde el mismo Overview — sin modos alternativos ni consola AWS.
