"use client";

import type React from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/elements/field";
import { RadioGroup, RadioGroupItem } from "@/components/elements/radio-group";
import { SettingsSection } from "./settings-section";

export type ColorMode = "light" | "dark" | "system";

export interface PaletteChoice {
  description?: string;
  label: string;
  swatch: readonly string[];
  value: string;
}

export interface AppearanceSettingsProps {
  mode: ColorMode;
  onModeChange: (mode: ColorMode) => void;
  onPaletteChange: (palette: string) => void;
  palette: string;
  palettes: readonly PaletteChoice[];
}

/** Fixed preview colours so each tile shows its mode, whatever is active. */
const MODE_PREVIEW = {
  light: { bg: "oklch(0.985 0.006 295)", ink: "oklch(0.21 0.03 285)" },
  dark: { bg: "oklch(0.16 0.03 285)", ink: "oklch(0.95 0.01 295)" },
} as const;

const MODES: { label: string; value: ColorMode }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const isColorMode = (value: string): value is ColorMode =>
  MODES.some((mode) => mode.value === value);

function ModePreview({ mode }: { mode: ColorMode }): React.JSX.Element {
  const light = MODE_PREVIEW.light;
  const dark = MODE_PREVIEW.dark;
  const half =
    mode === "system"
      ? `linear-gradient(90deg, ${light.bg} 50%, ${dark.bg} 50%)`
      : MODE_PREVIEW[mode].bg;
  const ink = mode === "dark" ? dark.ink : light.ink;
  return (
    <span
      aria-hidden="true"
      className="flex h-[76px] w-full flex-col gap-1.5 rounded-[10px] border p-2.5"
      style={{ background: half }}
    >
      <span className="h-2 w-3/5 rounded" style={{ background: ink }} />
      <span
        className="h-2 w-2/5 rounded opacity-60"
        style={{ background: ink }}
      />
      <span className="mt-auto h-3.5 w-9 rounded-full bg-primary" />
    </span>
  );
}

/** Light / Dark / System and the three palettes, as choice cards. */
export function AppearanceSettings({
  mode,
  onModeChange,
  palette,
  palettes,
  onPaletteChange,
}: AppearanceSettingsProps): React.JSX.Element {
  return (
    <SettingsSection id="appearance" title="Appearance">
      <FieldSet>
        <FieldLegend variant="label">Mode</FieldLegend>
        <RadioGroup
          className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3"
          onValueChange={(value) => {
            if (isColorMode(value)) {
              onModeChange(value);
            }
          }}
          value={mode}
        >
          {MODES.map(({ value, label }) => (
            <FieldLabel htmlFor={`mode-${value}`} key={value}>
              <Field className="flex-col items-stretch gap-2">
                <ModePreview mode={value} />
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    aria-label={label}
                    id={`mode-${value}`}
                    value={value}
                  />
                  <FieldTitle>{label}</FieldTitle>
                </div>
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label">Palette</FieldLegend>
        <RadioGroup
          className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3"
          onValueChange={onPaletteChange}
          value={palette}
        >
          {palettes.map((option) => (
            <FieldLabel htmlFor={`palette-${option.value}`} key={option.value}>
              <Field orientation="horizontal">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 overflow-hidden rounded-full border"
                >
                  {option.swatch.map((color) => (
                    <span
                      className="h-full flex-1"
                      key={color}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
                <FieldContent>
                  <FieldTitle>{option.label}</FieldTitle>
                  {option.description ? (
                    <FieldDescription>{option.description}</FieldDescription>
                  ) : null}
                </FieldContent>
                <RadioGroupItem
                  aria-label={option.label}
                  id={`palette-${option.value}`}
                  value={option.value}
                />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </FieldSet>
    </SettingsSection>
  );
}
