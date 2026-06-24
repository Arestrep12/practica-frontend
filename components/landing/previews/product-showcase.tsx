import { BrowserFrame } from "@/components/landing/previews/browser-frame";
import { DashboardPreview } from "@/components/landing/previews/dashboard-preview";
import { DeploymentsPreview } from "@/components/landing/previews/deployments-preview";
import { ProjectOverviewPreview } from "@/components/landing/previews/project-overview-preview";
import { mockProjects } from "@/lib/mock-projects";

const heroProjects = mockProjects.slice(0, 3);
const featuredProject = mockProjects[0];

type ProductShowcaseProps = {
  className?: string;
};

export function ProductShowcase({ className = "" }: ProductShowcaseProps) {
  return (
    <div className={`idp-preview-stack ${className}`}>
      <div className="idp-preview-stack-glow" aria-hidden />

      <div className="idp-preview-layer idp-preview-layer--dashboard">
        <span className="idp-preview-label">Dashboard</span>
        <BrowserFrame url="idp.internal.company/dashboard" className="idp-preview-frame--layer">
          <DashboardPreview projects={heroProjects.slice(0, 2)} compact />
        </BrowserFrame>
      </div>

      <div className="idp-preview-layer idp-preview-layer--overview">
        <span className="idp-preview-label">Overview</span>
        <BrowserFrame
          url={`idp.internal.company/projects/${featuredProject.name}`}
          className="idp-preview-frame--layer idp-preview-frame--primary"
        >
          <ProjectOverviewPreview project={featuredProject} compact />
        </BrowserFrame>
      </div>

      <div className="idp-preview-layer idp-preview-layer--deployments">
        <span className="idp-preview-label">Deployments</span>
        <BrowserFrame
          url={`idp.internal.company/projects/${featuredProject.name}/deployments`}
          className="idp-preview-frame--layer"
        >
          <DeploymentsPreview project={featuredProject} selectedIndex={0} />
        </BrowserFrame>
      </div>
    </div>
  );
}
