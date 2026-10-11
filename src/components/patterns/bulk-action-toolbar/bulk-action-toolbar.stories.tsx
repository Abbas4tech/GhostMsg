import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { BulkActionToolbar } from "./bulk-action-toolbar";
import { defaultBulkActionToolbarArgs } from "./bulk-action-toolbar.mock";

const READ_REGEX = /^read$/i;
const STAR_REGEX = /^star$/i;
const DELETE_REGEX = /^delete$/i;
const CSV_REGEX = /csv/i;
const JSON_REGEX = /json/i;

/** Floating, fixed-position toolbar shown while messages are selected. */
const meta = {
  title: "Patterns/BulkActionToolbar",
  component: BulkActionToolbar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="h-40">
        <Story />
      </div>
    ),
  ],
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
    await expect(canvas.getByText("3 selected")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: READ_REGEX }));
    await expect(args.onAction).toHaveBeenCalledWith("read");
    await userEvent.click(canvas.getByRole("button", { name: STAR_REGEX }));
    await expect(args.onAction).toHaveBeenCalledWith("star");
    await userEvent.click(canvas.getByRole("button", { name: DELETE_REGEX }));
    await expect(args.onAction).toHaveBeenCalledWith("delete");

    await userEvent.click(canvas.getByRole("button", { name: CSV_REGEX }));
    await expect(args.onExport).toHaveBeenCalledWith("csv");
    await userEvent.click(canvas.getByRole("button", { name: JSON_REGEX }));
    await expect(args.onExport).toHaveBeenCalledWith("json");

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
      canvas.getByRole("button", { name: DELETE_REGEX })
    ).toBeDisabled();
    // Exports are local and stay available.
    await expect(canvas.getByRole("button", { name: CSV_REGEX })).toBeEnabled();
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
