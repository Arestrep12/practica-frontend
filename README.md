# Internal Deploy Platform

Frontend de la plataforma interna de deploy para publicar productos existentes
en AWS desde una experiencia única, simple y operativa. La app está construida
con Vite, React y React Router; el backend de orquestación se consume como un
servicio separado.

## Alcance

Esta aplicación es el control plane visual de la plataforma:

- Lista proyectos internos desplegables.
- Muestra estado, URL activa, deployments, settings y logs.
- Permite modelar el flujo de publicar/redeploy sin exponer AWS al browser.
- Usa datos mock mientras se conecta el backend real.

No es un generador de aplicaciones ni un IDE. El producto parte de proyectos,
repositorios, imágenes o artefactos ya existentes.

## Stack

- npm como package manager.
- Vite como servidor de desarrollo y build tool.
- React con React Router para la SPA.
- Tailwind CSS v4 procesado con PostCSS.
- Runtime MVP de proyectos desplegados: `nodejs` sobre ECS Fargate.

## Desarrollo

Instala dependencias y levanta el servidor local:

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) para ver la app.

## Scripts

- `npm run dev` — inicia Vite en modo desarrollo.
- `npm run build` — valida tipos y genera el build de producción.
- `npm run preview` — sirve el build localmente.
- `npm run lint` — ejecuta ESLint.
- `npm run typecheck` — ejecuta TypeScript sin emitir archivos.

## Estructura

- `src/` — entrada Vite, router y estilos globales.
- `components/` — UI reutilizable.
- `lib/` — datos mock, utilidades y tipos compartidos.
- `public/` — assets estáticos servidos por Vite.
- `vite.config.ts` — configuración de Vite y alias `@`.
- `postcss.config.mjs` — configuración de Tailwind CSS vía PostCSS.

## Calidad

Después de cambios de código corre:

```bash
npm run lint
npm run typecheck
```

No hace falta correrlos cuando el cambio es solo documentación.
