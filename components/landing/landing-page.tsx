"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

const features = [
  {
    index: "01",
    title: "Conecta tu proyecto",
    description:
      "Repo interno, imagen en ECR o artefacto. Un solo formulario para registrar lo que ya construiste.",
  },
  {
    index: "02",
    title: "Publica en AWS",
    description:
      "La plataforma orquesta build y runtime en la cuenta corporativa. Sin consola ni Terraform por shipping.",
  },
  {
    index: "03",
    title: "Itera con un clic",
    description:
      "URL interna, historial de deployments, logs y redeploy desde el mismo dashboard — estilo Vercel.",
  },
] as const;

const steps = [
  { n: "1", label: "Nuevo proyecto", detail: "Nombre, origen y runtime" },
  { n: "2", label: "Publicar", detail: "Deploy asíncrono con estado en vivo" },
  { n: "3", label: "Overview", detail: "URL activa y último release" },
  { n: "4", label: "Redeploy", detail: "Misma config, nuevo intento" },
] as const;

const audiences = [
  "Apps de IA y agentes internos",
  "APIs y microservicios del equipo",
  "Frontends y sitios estáticos",
  "POCs que merecen URL hoy, no el viernes",
] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
};

function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`idp-reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--idp-delay": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-navy">
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-display text-lg font-bold tracking-tight">
            IDP
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
            <a href="#producto" className="transition-colors hover:text-navy">
              Producto
            </a>
            <a href="#como-funciona" className="transition-colors hover:text-navy">
              Cómo funciona
            </a>
            <a href="#para-quien" className="transition-colors hover:text-navy">
              Para quién
            </a>
          </nav>
          <Link
            href="#acceso"
            className="idp-btn idp-radius-md rounded-md border-2 border-navy bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-deep"
          >
            Solicitar acceso
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border">
        <div className="idp-hero-bg" aria-hidden>
          <div className="idp-hero-grid" />
          <div className="idp-hero-blob idp-hero-blob--a" />
          <div className="idp-hero-blob idp-hero-blob--b" />
          <div className="idp-hero-blob idp-hero-blob--c" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col items-center px-6 pb-20 pt-20 text-center md:min-h-[calc(100svh-4rem)] md:pt-28">
          <div className="flex flex-1 flex-col items-center justify-center">
            <h1
              className="idp-load-in font-display max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight text-navy md:text-6xl lg:text-7xl"
              style={{ "--idp-delay": "0.05s" } as React.CSSProperties}
            >
              Haz shipping rápido y sencillo de tus ideas
            </h1>

            <p
              className="idp-load-in mt-8 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
              style={{ "--idp-delay": "0.2s" } as React.CSSProperties}
            >
              Una experiencia única para volver real tu creatividad: conecta ya
              tus ideas, publica y comparte tu visión con los demás.
            </p>
          </div>

          <div
            className="idp-load-in mt-16 flex w-full flex-col items-center justify-center gap-4 pb-8 sm:flex-row md:mt-24 md:pb-16"
            style={{ "--idp-delay": "0.35s" } as React.CSSProperties}
          >
            <Link
              href="#acceso"
              className="idp-btn inline-flex items-center justify-center idp-radius-md rounded-md border-2 border-navy bg-navy px-8 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-navy-deep"
            >
              Empezar ahora
            </Link>
            <Link
              href="#como-funciona"
              className="idp-btn inline-flex items-center justify-center idp-radius-md rounded-md border-2 border-navy bg-white px-8 py-4 text-sm font-bold uppercase tracking-wider text-navy hover:bg-surface"
            >
              Ver cómo funciona
            </Link>
          </div>
        </div>
      </section>

      <section id="producto" className="border-b border-border py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-accent">
              Producto
            </p>
            <h2 className="font-display mt-4 max-w-3xl text-3xl font-bold leading-tight text-navy md:text-5xl">
              Deploy interno con la claridad de Vercel
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              Dashboard, proyectos, deployments y settings en las mismas pantallas para
              todos. Lo avanzado vive donde debe: logs en el detalle, variables en
              configuración.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.index} as="article" delay={i * 0.12}>
                <div className="group idp-lift idp-radius-lg h-full rounded-lg border border-border bg-white p-8 md:p-10">
                  <span className="font-display text-4xl font-bold text-blue-light transition-colors duration-300 group-hover:text-blue-accent">
                    {f.index}
                  </span>
                  <h3 className="font-display mt-6 text-xl font-bold text-navy">{f.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{f.description}</p>
                  <div className="mt-8 h-px w-full bg-border transition-colors duration-300 group-hover:bg-blue-accent" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="border-b border-border bg-surface py-24 md:py-32"
      >
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-accent">
              Flujo
            </p>
            <h2 className="font-display mt-4 max-w-2xl text-3xl font-bold text-navy md:text-5xl">
              Cuatro pasos. Una sola interfaz.
            </h2>
          </Reveal>

          <div className="mt-16 flex flex-col gap-4 md:flex-row">
            {steps.map((step, i) => (
              <Reveal key={step.n} className="flex flex-1" delay={i * 0.1}>
                <div className="idp-lift flex w-full flex-col idp-radius-lg rounded-lg border-2 border-navy bg-white p-8">
                  <span className="inline-flex h-10 w-10 items-center justify-center idp-radius-md rounded-md border-2 border-navy font-display text-lg font-bold text-navy">
                    {step.n}
                  </span>
                  <h3 className="font-display mt-6 text-lg font-bold">{step.label}</h3>
                  <p className="mt-2 text-sm text-muted">{step.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <div className="mt-12 idp-radius-lg rounded-lg border-2 border-navy bg-white p-8 md:p-12">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                    Navegación
                  </p>
                  <p className="font-display mt-2 text-2xl font-bold text-navy md:text-3xl">
                    Dashboard → Proyecto → Deployments
                  </p>
                </div>
                <p className="max-w-md text-sm leading-relaxed text-muted">
                  Overview con URL y redeploy. Settings para variables. Detalle del
                  deployment con logs y commit — una sola experiencia para todos.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="para-quien" className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-stretch gap-16 lg:grid-cols-2 lg:gap-24">
            <Reveal>
              <h2 className="font-display text-3xl font-bold text-navy md:text-5xl">
                Para quien ya tiene el producto listo
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted">
                Makers de IA, product owners e ingenieros comparten el mismo camino al
                deploy. El técnico no necesita otra herramienta; el no técnico no
                necesita aprender AWS.
              </p>
            </Reveal>

            <ul className="flex h-full min-h-[280px] flex-col overflow-hidden idp-radius-lg rounded-lg border border-border lg:min-h-0">
              {audiences.map((item, i) => (
                <Reveal
                  key={item}
                  as="li"
                  delay={i * 0.1}
                  className={`flex flex-1 items-center gap-4 bg-white px-6 py-5 transition-colors duration-300 hover:bg-surface ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span className="h-2 w-2 shrink-0 idp-radius-sm rounded-sm bg-navy" aria-hidden />
                  <span className="font-medium text-navy">{item}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="acceso"
        className="border-t-4 border-navy bg-navy py-24 text-white md:py-32"
      >
        <div className="mx-auto max-w-6xl px-6 text-center text-white">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-white md:text-5xl lg:text-6xl">
              Tu próximo shipping, en minutos
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/90">
              Internal Deploy Platform — solo deploy, solo AWS interno, una experiencia
              para todos.
            </p>
            <Link
              href="#"
              className="idp-btn mt-10 inline-flex idp-radius-md rounded-md border-2 border-white bg-white px-10 py-4 text-sm font-bold uppercase tracking-wider text-navy hover:bg-blue-light"
            >
              Solicitar acceso
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
