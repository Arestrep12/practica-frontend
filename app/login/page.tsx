import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/login-page";

export const metadata: Metadata = {
  title: "Iniciar sesión — IDP",
  description: "Accede a la plataforma de deploy interno.",
};

export default function Login() {
  return <LoginPage />;
}
