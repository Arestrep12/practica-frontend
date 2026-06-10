"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = "email" | "password";

export function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStep("password");
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-10 flex justify-center">
          <Link
            href="/"
            className="font-display text-2xl font-bold tracking-tight text-navy"
          >
            IDP
          </Link>
        </div>

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <h1 className="text-center text-2xl font-semibold text-navy">
              Inicia sesión
            </h1>

            <div className="group relative rounded-md border border-border px-3 pb-2.5 pt-4 transition-colors focus-within:border-blue-accent">
              <label
                htmlFor="email"
                className="pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-sm text-muted transition-colors group-focus-within:text-blue-accent"
              >
                Correo electrónico<span className="text-navy">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-base text-navy outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full idp-radius-md rounded-md bg-navy py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
            >
              Continuar
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <h1 className="text-center text-2xl font-semibold text-navy">
              Introduce tu contraseña
            </h1>

            <div className="flex items-center justify-between gap-3 idp-radius-md rounded-md border border-border px-4 py-3">
              <span className="truncate text-sm text-navy">{email}</span>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="shrink-0 text-sm font-medium text-blue-accent transition-colors hover:text-navy"
              >
                Editar
              </button>
            </div>

            <div className="group relative rounded-md border border-border px-3 pb-2.5 pt-4 transition-colors focus-within:border-blue-accent">
              <label
                htmlFor="password"
                className="pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-white px-1 text-sm text-muted transition-colors group-focus-within:text-blue-accent"
              >
                Contraseña<span className="text-navy">*</span>
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent pr-10 text-base text-navy outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-[calc(50%+4px)] -translate-y-1/2 text-muted transition-colors hover:text-navy"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="size-5" strokeWidth={1.75} aria-hidden />
                ) : (
                  <Eye className="size-5" strokeWidth={1.75} aria-hidden />
                )}
              </button>
            </div>

            <div>
              <Link
                href="#"
                className="text-sm font-medium text-blue-accent transition-colors hover:text-navy"
              >
                ¿Has olvidado tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full idp-radius-md rounded-md bg-navy py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-deep"
            >
              Continuar
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-muted">
          ¿No tienes una cuenta?{" "}
          <Link
            href="#"
            className="font-medium text-blue-accent transition-colors hover:text-navy"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
