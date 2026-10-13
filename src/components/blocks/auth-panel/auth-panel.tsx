import type React from "react";

export interface AuthPanelProps {
  /** The auth form pattern (sign-in, sign-up or verify). */
  children: React.ReactNode;
  description?: React.ReactNode;
  /** Optional icon tile above the heading (e.g. a mail icon on /verify). */
  icon?: React.ReactNode;
  title: React.ReactNode;
}

/** One centred card at every width: optional icon, heading, subtitle, form. */
export function AuthPanel({
  title,
  description,
  icon,
  children,
}: AuthPanelProps): React.JSX.Element {
  return (
    <main
      className="flex justify-center px-4 pt-4 pb-16 sm:pt-10"
      data-slot="auth-panel"
    >
      <section className="flex w-full max-w-[440px] flex-col gap-5 rounded-xl border bg-card p-6 text-card-foreground shadow-soft sm:p-7">
        <header className="flex flex-col gap-3">
          {icon ? (
            <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground [&_svg]:size-6">
              {icon}
            </span>
          ) : null}
          <h1 className="font-bold text-[28px] leading-tight tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="text-muted-foreground">{description}</p>
          ) : null}
        </header>
        {children}
      </section>
    </main>
  );
}

export default AuthPanel;
