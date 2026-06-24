import { Lock } from "lucide-react";
import type { ReactNode } from "react";

type BrowserFrameProps = {
  url: string;
  children: ReactNode;
  className?: string;
  /** Oculta la barra del browser para previews compactos */
  chrome?: boolean;
};

export function BrowserFrame({
  url,
  children,
  className = "",
  chrome = true,
}: BrowserFrameProps) {
  return (
    <div
      className={`idp-preview-frame overflow-hidden idp-radius-lg border-2 border-navy bg-white shadow-[0_24px_64px_-24px_rgba(11,31,58,0.35)] ${className}`}
      aria-hidden
    >
      {chrome && (
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2.5">
          <div className="flex shrink-0 gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 idp-radius-md rounded-md border border-border bg-white px-3 py-1 text-[11px] text-muted">
            <Lock className="size-3 shrink-0 opacity-60" strokeWidth={2} aria-hidden />
            <span className="truncate font-medium">{url}</span>
          </div>
        </div>
      )}
      <div className="relative select-none">{children}</div>
    </div>
  );
}
