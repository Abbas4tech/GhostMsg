import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Trash2 } from "lucide-react";
import type React from "react";
import { useCallback } from "react";
import { expect, fn, screen, waitFor } from "storybook/test";
import { Button } from "@/components/elements/button";
import { type ShowUndoToastOptions, showUndoToast } from "./undo-toast";
import { defaultUndoToastOptions } from "./undo-toast.mock";

/**
 * The global `<Toaster/>` is mounted by `.storybook/preview.tsx`, so the story
 * only shows the toast. Only "Delete all" in Danger zone uses it (ADR 0034).
 */
function UndoToastTrigger(args: ShowUndoToastOptions): React.JSX.Element {
  const handleClick = useCallback(() => {
    showUndoToast({ ...args, icon: <Trash2 aria-hidden="true" /> });
  }, [args]);
  return <Button onClick={handleClick}>Delete all</Button>;
}

const meta = {
  args: { ...defaultUndoToastOptions, onCommit: fn(), onUndo: fn() },
  argTypes: {
    durationMs: {
      control: { min: 1000, step: 1000, type: "number" },
      description: "How long Undo stays (the bar drains over it)",
    },
    message: { control: "text", description: "One line, verb first" },
    onCommit: { description: "Toast closed without Undo" },
    onUndo: { description: "Undo clicked" },
  },
  component: UndoToastTrigger,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Patterns/UndoToast",
} satisfies Meta<typeof UndoToastTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Undoes: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Delete all" }));
    await waitFor(() =>
      expect(screen.getByText(defaultUndoToastOptions.message)).toBeVisible()
    );
    await userEvent.click(screen.getByRole("button", { name: "Undo" }));
    await expect(args.onUndo).toHaveBeenCalledOnce();
    await expect(args.onCommit).not.toHaveBeenCalled();
  },
};

/** Runs out after 1.5s: the action commits instead. */
export const Commits: Story = {
  args: { durationMs: 1500 },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Delete all" }));
    await waitFor(() => expect(args.onCommit).toHaveBeenCalledOnce(), {
      timeout: 5000,
    });
    await expect(args.onUndo).not.toHaveBeenCalled();
  },
};
