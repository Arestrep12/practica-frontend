import type { Metadata } from "next";
import { IBM_Plex_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "IDP — Deploy interno en AWS",
  description:
    "Plataforma de deploy interno para productos de la empresa. Una experiencia simple, profesional y unificada.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${plex.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
