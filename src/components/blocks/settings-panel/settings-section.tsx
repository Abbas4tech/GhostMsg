"use client";

import type React from "react";
import { createContext, useContext, useId } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/elements/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/elements/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/elements/field";
import { Switch } from "@/components/elements/switch";
import { cn } from "@/lib/utils";

/**
 * "cards": desktop, every section an expanded card beside "On this page".
 * "list": phones, the design's grouped list where each section is an
 * accordion row (icon tile, title, one-line summary) inside an `<Accordion>`.
 */
export type SettingsLayout = "cards" | "list";

const SettingsLayoutContext = createContext<SettingsLayout>("cards");

export function SettingsLayoutProvider({
  children,
  layout,
}: {
  children: React.ReactNode;
  layout: SettingsLayout;
}): React.JSX.Element {
  return (
    <SettingsLayoutContext value={layout}>{children}</SettingsLayoutContext>
  );
}

export const useSettingsLayout = (): SettingsLayout =>
  useContext(SettingsLayoutContext);

/* Grouped-list parts (design `.item-group` / `.item`): 56px rows, 16px gutter, 36px icon tile. */
const listRowClassName =
  "flex min-h-14 w-full items-center gap-3 px-4 py-2.5 text-left";
const listMediaClassName =
  "grid size-9 shrink-0 place-items-center rounded-[11px] bg-accent text-accent-foreground [&_svg]:size-5";
const listMediaDangerClassName =
  "bg-[color-mix(in_oklch,var(--destructive)_12%,var(--card))] text-destructive";

/** A titled group of list rows: overline label above one bordered card. */
export function SettingsListGroup({
  children,
  className,
  label,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
  tone?: "default" | "danger";
}): React.JSX.Element {
  const labelId = useId();
  return (
    <section
      aria-labelledby={label ? labelId : undefined}
      className="flex flex-col gap-2"
    >
      {label ? (
        <h2
          className={cn(
            "px-1 text-overline uppercase",
            tone === "danger" ? "text-destructive" : "text-muted-foreground"
          )}
          id={labelId}
        >
          {label}
        </h2>
      ) : null}
      <div
        className={cn(
          "divide-y overflow-hidden rounded-xl border bg-card",
          tone === "danger" &&
            "border-[color-mix(in_oklch,var(--destructive)_35%,transparent)]",
          className
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** Icon tile + title + optional summary: the inside of a list row. */
export function SettingsListRowBody({
  description,
  icon,
  title,
  tone = "default",
}: {
  description?: React.ReactNode;
  icon?: React.ReactNode;
  title: React.ReactNode;
  tone?: "default" | "danger";
}): React.JSX.Element {
  return (
    <>
      {icon ? (
        <span
          aria-hidden="true"
          className={cn(
            listMediaClassName,
            tone === "danger" && listMediaDangerClassName
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span
          className={cn("text-title", tone === "danger" && "text-destructive")}
        >
          {title}
        </span>
        {description ? (
          <span className="font-normal text-muted-foreground text-sm">
            {description}
          </span>
        ) : null}
      </span>
    </>
  );
}

/** A list row that is one button (Sign out, Delete all messages…). */
export function SettingsListButton({
  description,
  icon,
  onClick,
  title,
  tone = "default",
}: {
  description?: React.ReactNode;
  icon?: React.ReactNode;
  onClick: () => void;
  title: string;
  tone?: "default" | "danger";
}): React.JSX.Element {
  return (
    <button
      className={cn(
        listRowClassName,
        "outline-none transition-colors hover:bg-accent/50 focus-visible:bg-accent/50"
      )}
      onClick={onClick}
      type="button"
    >
      <SettingsListRowBody
        description={description}
        icon={icon}
        title={title}
        tone={tone}
      />
    </button>
  );
}

/** A static list row with a trailing control (identity, Message Acceptance, blocked sender). */
export function SettingsListRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): React.JSX.Element {
  return <div className={cn(listRowClassName, className)}>{children}</div>;
}

/**
 * One settings section. Desktop: a card with an anchor id (for "On this
 * page"). Phones: an accordion row whose summary says what's set, expanding
 * to the same controls; it must sit inside an `<Accordion>`.
 */
export function SettingsSection({
  id,
  title,
  aside,
  icon,
  summary,
  tone = "default",
  children,
}: {
  aside?: React.ReactNode;
  children: React.ReactNode;
  /** List layout: the row's icon tile. */
  icon?: React.ReactNode;
  id: string;
  /** List layout: one line under the title, e.g. "Balanced · 3 blocked". */
  summary?: React.ReactNode;
  title: string;
  tone?: "default" | "danger";
}): React.JSX.Element {
  const titleId = useId();
  const layout = useSettingsLayout();

  if (layout === "list") {
    return (
      <AccordionItem className="scroll-mt-6" id={id} value={id}>
        <AccordionTrigger
          className={cn(
            listRowClassName,
            "rounded-none py-2.5 font-normal text-base hover:bg-accent/50 hover:no-underline focus-visible:ring-inset [&>svg]:size-5 [&>svg]:translate-y-0 [&>svg]:-rotate-90 [&[data-state=open]>svg]:rotate-0"
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-3">
            <SettingsListRowBody
              description={summary}
              icon={icon}
              title={title}
            />
          </span>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 px-4 pt-2 pb-4">
          {aside}
          <FieldGroup className="gap-4">{children}</FieldGroup>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Card
      aria-labelledby={titleId}
      className={cn(
        "scroll-mt-6",
        tone === "danger" &&
          "border-destructive/40 bg-[color-mix(in_oklch,var(--destructive)_5%,var(--card))]"
      )}
      id={id}
      role="region"
      variant="elevated"
    >
      <CardHeader className="flex flex-wrap items-baseline justify-between gap-3">
        <CardTitle>
          <h2
            className={cn("text-h3", tone === "danger" && "text-destructive")}
            id={titleId}
          >
            {title}
          </h2>
        </CardTitle>
        {aside}
      </CardHeader>
      <CardContent>
        <FieldGroup className="gap-4">{children}</FieldGroup>
      </CardContent>
    </Card>
  );
}

/** Row divider between settings inside a section. */
export const SettingsDivider = (): React.JSX.Element => <FieldSeparator />;

/** Title + hint on the left, any control on the right. */
export function SettingRow({
  title,
  description,
  htmlFor,
  badge,
  control,
  className,
}: {
  badge?: React.ReactNode;
  className?: string;
  control: React.ReactNode;
  description?: React.ReactNode;
  htmlFor?: string;
  title: string;
}): React.JSX.Element {
  return (
    <Field className={className} orientation="horizontal">
      <FieldContent>
        <div className="flex flex-wrap items-center gap-2">
          {htmlFor ? (
            <FieldLabel className="text-title" htmlFor={htmlFor}>
              {title}
            </FieldLabel>
          ) : (
            <b className="text-title">{title}</b>
          )}
          {badge}
        </div>
        {description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}
      </FieldContent>
      {control}
    </Field>
  );
}

/** A setting whose control is a Switch. */
export function SwitchSetting({
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
  badge,
}: {
  badge?: React.ReactNode;
  checked: boolean;
  description?: React.ReactNode;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
  title: string;
}): React.JSX.Element {
  const id = useId();
  return (
    <SettingRow
      badge={badge}
      control={
        <Switch
          checked={checked}
          disabled={disabled}
          id={id}
          onCheckedChange={onCheckedChange}
          size="xl"
        />
      }
      description={description}
      htmlFor={id}
      title={title}
    />
  );
}
