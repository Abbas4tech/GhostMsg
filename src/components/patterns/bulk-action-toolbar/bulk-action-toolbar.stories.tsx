import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { BulkActionToolbar } from "./bulk-action-toolbar";
import { defaultBulkActionToolbarArgs } from "./bulk-action-toolbar.mock";

/** Dark pill shown above the cards while messages are selected. */
const meta = {
  title: "Patterns/BulkActionToolbar",
  component: BulkActionToolbar,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    ...defaultBulkActionToolbarArgs,
    onAction: fn(),
    onExport: fn(),
    onClearSelection: fn(),
  },
  argTypes: {
    selectedCount: {
      control: { type: "number", min: 0 },
      description: "Selected messages; renders nothing at 0",
    },
    isPending: {
      control: "boolean",
      description: "Disables mutating actions while a bulk request runs",
    },
    onAction: { description: "`read` | `star` | `delete`" },
    onExport: { description: "`csv` | `json`" },
    onClearSelection: { description: "X clicked" },
  },
} satisfies Meta<typeof BulkActionToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByRole("toolbar", { name: "Bulk actions" })
    ).toHaveTextContent("3 selected");

    await userEvent.click(canvas.getByRole("button", { name: "Mark read" }));
    await expect(args.onAction).toHaveBeenCalledWith("read");
    await userEvent.click(canvas.getByRole("button", { name: "Star" }));
    await expect(args.onAction).toHaveBeenCalledWith("star");
    await userEvent.click(
      canvas.getByRole("button", { name: "Delete selected" })
    );
    await expect(args.onAction).toHaveBeenCalledWith("delete");

    await userEvent.click(canvas.getByRole("button", { name: "Export" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "CSV" }));
    await expect(args.onExport).toHaveBeenCalledWith("csv");

    await userEvent.click(
      canvas.getByRole("button", { name: "Clear selection" })
    );
    await expect(args.onClearSelection).toHaveBeenCalled();
  },
};

export const SingleSelected: Story = { args: { selectedCount: 1 } };

export const Pending: Story = {
  args: { isPending: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Delete selected" })
    ).toBeDisabled();
    // Exports are local and stay available.
    await expect(canvas.getByRole("button", { name: "Export" })).toBeEnabled();
  },
};

export const NothingSelected: Story = {
  args: { selectedCount: 0 },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="bulk-action-toolbar"]')
    ).toBeNull();
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
