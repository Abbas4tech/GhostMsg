import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { BulkActionToolbar } from "./bulk-action-toolbar";
import { defaultBulkActionToolbarArgs } from "./bulk-action-toolbar.mock";

/** Dark pill shown above the cards while messages are selected. */
const meta = {
  args: {
    ...defaultBulkActionToolbarArgs,
    onAction: fn(),
    onClearSelection: fn(),
    onExport: fn(),
  },
  argTypes: {
    isPending: {
      control: "boolean",
      description: "Disables mutating actions while a bulk request runs",
    },
    layout: {
      control: "radio",
      description:
        "pill: above the cards (desktop); bar: over the phone tab bar",
      options: ["pill", "bar"],
    },
    onAction: { description: "`read` | `star` | `delete`" },
    onClearSelection: { description: "X clicked" },
    onExport: { description: "`csv` | `json`" },
    selectedCount: {
      control: { min: 0, type: "number" },
      description: "Selected messages; renders nothing at 0",
    },
  },
  component: BulkActionToolbar,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  title: "Patterns/BulkActionToolbar",
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
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};

/** Design MobInboxSelect: the bottom action bar over the tab bar. */
export const PhoneBar: Story = {
  args: { layout: "bar" },
  globals: { viewport: { isRotated: false, value: "mobile1" } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("toolbar", { name: "Bulk actions" })
    ).toBeVisible();
  },
};
