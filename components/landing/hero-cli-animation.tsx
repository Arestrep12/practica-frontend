"use client";

import { useEffect, useState } from "react";

type LineTone = "default" | "muted" | "success" | "info";

type ScriptLine =
  | { kind: "prompt"; text: string }
  | { kind: "line"; text: string; tone?: LineTone };

const PROMPT = "idp › ";

const script: ScriptLine[] = [
  { kind: "line", text: "Internal Deploy Platform · AWS interno", tone: "muted" },
  { kind: "line", text: "─────────────────────────────────────", tone: "muted" },
  { kind: "prompt", text: "login" },
  { kind: "line", text: "✓ Sesión iniciada como maria.restrepo@company.com", tone: "success" },
  { kind: "prompt", text: "project create agente-soporte-ia --runtime nodejs" },
  { kind: "line", text: "✓ Proyecto registrado · origen plataforma/agente-soporte-ia", tone: "success" },
  { kind: "prompt", text: "deploy --env prod-interno --branch main" },
  { kind: "line", text: "⋯ Clonando main @ 9f3a2c1", tone: "info" },
  { kind: "line", text: "⋯ Build completado en 51s", tone: "info" },
  { kind: "line", text: "⋯ Publicando en prod-interno", tone: "info" },
  {
    kind: "line",
    text: "✓ Activo → https://agente-soporte-ia.internal.company",
    tone: "success",
  },
  { kind: "prompt", text: "deployments list" },
  { kind: "line", text: "  dpl_9f3a2c  Activo   main  Hace 2 h", tone: "muted" },
];

const toneClass: Record<LineTone, string> = {
  default: "text-navy",
  muted: "text-muted",
  success: "text-emerald-700",
  info: "text-blue-accent",
};

const TYPING_MS = 36;
const LINE_PAUSE_MS = 400;

function CliCursor() {
  return (
    <span className="idp-cli-cursor ml-px inline-block h-[1.1em] w-2 align-[-0.15em] bg-blue-accent" />
  );
}

function ScriptLineView({ line }: { line: ScriptLine }) {
  if (line.kind === "prompt") {
    return (
      <p className="text-navy">
        <span className="text-blue-accent">{PROMPT}</span>
        {line.text}
      </p>
    );
  }

  return <p className={toneClass[line.tone ?? "default"]}>{line.text}</p>;
}

function EmptyPromptLine({ showCursor }: { showCursor: boolean }) {
  return (
    <p className="text-navy">
      <span className="text-blue-accent">{PROMPT}</span>
      {showCursor ? <CliCursor /> : null}
    </p>
  );
}

export function HeroCliAnimation() {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(0);

  const finished = step >= script.length;
  const current = finished ? null : script[step];
  const completed = script.slice(0, step);

  useEffect(() => {
    if (finished) return;

    if (!current) return;

    if (current.kind === "line") {
      const timer = window.setTimeout(() => setStep((s) => s + 1), LINE_PAUSE_MS);
      return () => window.clearTimeout(timer);
    }

    if (typed < current.text.length) {
      const timer = window.setTimeout(() => setTyped((n) => n + 1), TYPING_MS);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setStep((s) => s + 1);
      setTyped(0);
    }, LINE_PAUSE_MS);

    return () => window.clearTimeout(timer);
  }, [finished, current, typed]);

  return (
    <div className="idp-hero-cli" aria-hidden>
      <p className="idp-hero-cli-brand font-display text-5xl font-bold tracking-tight text-navy md:text-6xl lg:text-7xl">
        IDP
      </p>

      <div className="idp-hero-cli-terminal relative mt-6 font-mono text-[11px] leading-relaxed sm:text-xs md:text-sm md:leading-relaxed">
        {/* Reserva altura final desde el inicio */}
        <div className="invisible pointer-events-none select-none" aria-hidden>
          {script.map((line, i) => (
            <ScriptLineView key={`sizer-${i}`} line={line} />
          ))}
          <EmptyPromptLine showCursor={false} />
        </div>

        <div className="absolute inset-0 text-left">
          {completed.map((line, i) => (
            <ScriptLineView key={i} line={line} />
          ))}

          {!finished && current?.kind === "line" && <ScriptLineView line={current} />}

          {!finished && current?.kind === "prompt" && (
            <p className="text-navy">
              <span className="text-blue-accent">{PROMPT}</span>
              {current.text.slice(0, typed)}
              <CliCursor />
            </p>
          )}

          {finished && <EmptyPromptLine showCursor />}
        </div>
      </div>
    </div>
  );
}
