"use client";

import type { VariantProps } from "class-variance-authority";
import { PaletteIcon } from "lucide-react";
import type * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/elements/dropdown-menu";
import { buttonVariants } from "@/components/elements/icon-button/icon-button";
import { isPalette, PALETTE_META, PALETTES } from "@/lib/theme/palette";
import { cn } from "@/lib/utils";
import { usePalette } from "@/providers/palette-provider";

export interface PalettePickerOption {
  description?: string;
  label: string;
  /** Fixed preview colours, shown as a split dot. */
  swatch: readonly string[];
  value: string;
}

type PalettePickerProps = Omit<
  React.ComponentProps<"button">,
  "value" | "onChange"
> &
  VariantProps<typeof buttonVariants> & {
    align?: "start" | "center" | "end";
    /** Accessible name of the trigger and heading of the menu. */
    label?: string;
    onValueChange: (value: string) => void;
    options: readonly PalettePickerOption[];
    value: string;
  };

function Swatch({ colors }: { colors: readonly string[] }): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 overflow-hidden rounded-full border border-foreground/15"
      data-slot="palette-picker-swatch"
    >
      {colors.map((color) => (
        <span
          className="h-full flex-1"
          key={color}
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );
}

/** Icon button that opens a radio menu of colour palettes (shadcn DropdownMenu). */
function PalettePicker({
  options,
  value,
  onValueChange,
  label = "Color theme",
  align = "end",
  variant = "ghost",
  size = "default",
  className,
  ...props
}: PalettePickerProps): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={label}
          className={cn(buttonVariants({ className, size, variant }))}
          data-slot="palette-picker-trigger"
          type="button"
          {...props}
        >
          <PaletteIcon />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-64" sideOffset={6}>
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuRadioGroup onValueChange={onValueChange} value={value}>
          {options.map((option) => (
            <DropdownMenuRadioItem
              className="min-h-11 gap-3"
              key={option.value}
              value={option.value}
            >
              <Swatch colors={option.swatch} />
              <span className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                {option.description ? (
                  <span className="text-muted-foreground text-xs">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const PALETTE_OPTIONS: PalettePickerOption[] = PALETTES.map((palette) => ({
  value: palette,
  ...PALETTE_META[palette],
}));

type PalettePickerButtonProps = Omit<
  PalettePickerProps,
  "options" | "value" | "onValueChange"
>;

/** PalettePicker wired to the app palette (like ThemeTogglerButton for mode). */
function PalettePickerButton(
  props: PalettePickerButtonProps
): React.JSX.Element {
  const { palette, setPalette } = usePalette();
  return (
    <PalettePicker
      onValueChange={(next) => {
        if (isPalette(next)) {
          setPalette(next);
        }
      }}
      options={PALETTE_OPTIONS}
      value={palette}
      {...props}
    />
  );
}

export {
  PALETTE_OPTIONS,
  PalettePicker,
  PalettePickerButton,
  type PalettePickerButtonProps,
  type PalettePickerProps,
};
