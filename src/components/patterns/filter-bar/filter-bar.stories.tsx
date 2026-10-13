import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { FilterBar } from "./filter-bar";
import {
  defaultFilterBarArgs,
  noQuarantineFilterBarArgs,
  searchingFilterBarArgs,
} from "./filter-bar.mock";

const QUARANTINED_REGEX = /quarantined/i;
const STARRED_REGEX = /starred/i;

const meta = {
  title: "Patterns/FilterBar",
  component: FilterBar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: { ...defaultFilterBarArgs, onStatusChange: fn(), onSearchChange: fn() },
  argTypes: {
    activeStatus: {
      control: "select",
      options: ["all", "unread", "starred", "answered", "quarantined"],
      description: "Highlighted status chip",
    },
    searchQuery: { control: "text", description: "Controlled search text" },
    counts: {
      control: "object",
      description:
        "Per-status counts (chip suffixes). Quarantined chip only shows when > 0.",
    },
    onStatusChange: { description: "Chip clicked → status" },
    onSearchChange: { description: "Search input changed → text" },
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "All (5)" })).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Unread (2)" })
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: QUARANTINED_REGEX })
    ).toBeVisible();
  },
};

export const ChangesStatus: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: STARRED_REGEX }));
    await expect(args.onStatusChange).toHaveBeenCalledWith("starred");
  },
};

export const Searches: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByPlaceholderText("Search messages..."),
      "s"
    );
    await expect(args.onSearchChange).toHaveBeenCalledWith("s");
  },
};

export const WithSearchQuery: Story = { args: searchingFilterBarArgs };

export const StarredActive: Story = { args: { activeStatus: "starred" } };

export const QuarantinedActive: Story = {
  args: { activeStatus: "quarantined" },
};

export const NoQuarantined: Story = {
  args: noQuarantineFilterBarArgs,
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole("button", { name: QUARANTINED_REGEX })
    ).not.toBeInTheDocument();
  },
};

export const WithoutCounts: Story = { args: { counts: undefined } };

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
