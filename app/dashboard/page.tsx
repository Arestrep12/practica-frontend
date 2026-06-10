import type { Metadata } from "next";
import { DashboardPage } from "@/components/dashboard/dashboard-page";

export const metadata: Metadata = {
  title: "Proyectos — IDP",
  description: "Dashboard de proyectos desplegados en AWS interno.",
};

export default function Dashboard() {
  return <DashboardPage />;
}
