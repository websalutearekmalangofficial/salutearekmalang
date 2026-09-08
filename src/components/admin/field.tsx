import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="block text-xs font-black uppercase tracking-wide text-ut-navy">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25";

export const textareaClass =
  "min-h-24 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25";

export function AdminCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-card p-5 shadow-benefit">
      <h2 className="font-display text-xl font-black text-ut-navy">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}
