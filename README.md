# Internal Deploy Platform

Frontend de la plataforma interna de deploy. La app está construida con Vite,
React y React Router; el backend de orquestación se consume como servicio
separado.

## Getting Started

Instala dependencias y levanta el servidor de desarrollo:

```bash
bun install
bun run dev
```

Abre [http://localhost:5173](http://localhost:5173) para ver la app.

## Scripts

```bash
bun run dev
bun run build
bun run preview
bun run lint
bun run typecheck
```

## Estructura

- `src/` — entrada Vite, router y estilos globales.
- `components/` — UI reutilizable.
- `lib/` — datos mock, utilidades y tipos compartidos.
- `public/` — assets estáticos servidos por Vite.

## Calidad

Después de cambios de código corre:

```bash
bun run lint
bun run typecheck
```
