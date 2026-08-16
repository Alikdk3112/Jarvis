import type { ReactNode } from "react";

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel flex flex-col gap-3 p-4 ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between">
          {title && (
            <h2 className="text-xs font-semibold tracking-wide text-ink-3 uppercase">{title}</h2>
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
