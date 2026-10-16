"use client";

import type React from "react";
import { useId } from "react";
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

/** One settings card with an anchor id (for "On this page"). */
export function SettingsSection({
  id,
  title,
  aside,
  tone = "default",
  children,
}: {
  aside?: React.ReactNode;
  children: React.ReactNode;
  id?: string;
  title: string;
  tone?: "default" | "danger";
}): React.JSX.Element {
  const titleId = useId();
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
            className={cn(
              "font-bold text-xl",
              tone === "danger" && "text-destructive"
            )}
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
            <FieldLabel className="font-bold text-[15px]" htmlFor={htmlFor}>
              {title}
            </FieldLabel>
          ) : (
            <b className="text-[15px]">{title}</b>
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
