import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { mixedMessageCounts } from "@/mock/fixtures/messages.fixtures";
import { FilterBar } from "./filter-bar";
import {
  defaultFilterBarArgs,
  noQuarantineFilterBarArgs,
  quarantinedActiveFilterBarArgs,
} from "./filter-bar.mock";

const QUARANTINED_REGEX = /quarantined/i;
const UNREAD_REGEX = /unread/i;
const ALL_REGEX = /^all/i;
const ARCHIVED_REGEX = /archived/i;

const meta = {
  args: { ...defaultFilterBarArgs, onStatusChange: fn() },
  argTypes: {
    activeStatus: {
      control: "select",
      description: "Selected chip",
      options: [
        "all",
        "unread",
        "starred",
        "answered",
        "archived",
        "quarantined",
      ],
    },
    counts: { control: "object", description: "Count per status" },
    disabled: {
      control: "boolean",
      description: "Phones in selection mode: chips can't change",
    },
    onStatusChange: { description: "Chip clicked → status" },
  },
  component: FilterBar,
  tags: ["autodocs"],
  title: "Patterns/FilterBar",
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByRole("radio", { name: ALL_REGEX })
    ).toHaveAttribute("aria-checked", "true");
    await userEvent.click(canvas.getByRole("radio", { name: UNREAD_REGEX }));
    await expect(args.onStatusChange).toHaveBeenCalledWith("unread");
    await expect(
      canvas.getByRole("radio", { name: QUARANTINED_REGEX })
    ).toHaveTextContent(String(mixedMessageCounts.quarantined));
  },
};

export const KeepsOneSelected: Story = {
  play: async ({ args, canvas, userEvent }) => {
    // Clicking the active chip must not clear the filter.
    await userEvent.click(canvas.getByRole("radio", { name: ALL_REGEX }));
    await expect(args.onStatusChange).not.toHaveBeenCalled();
  },
};

export const NoQuarantine: Story = {
  args: noQuarantineFilterBarArgs,
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole("radio", { name: QUARANTINED_REGEX })
    ).not.toBeInTheDocument();
  },
};

export const QuarantinedActive: Story = {
  args: quarantinedActiveFilterBarArgs,
};

export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};

/** The Archived chip appears once anything is archived. */
export const WithArchived: Story = {
  args: { counts: { ...mixedMessageCounts, archived: 3 } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("radio", { name: ARCHIVED_REGEX })
    ).toBeVisible();
  },
};

export const NoArchived: Story = {
  args: { counts: { ...mixedMessageCounts, archived: 0 } },
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole("radio", { name: ARCHIVED_REGEX })
    ).not.toBeInTheDocument();
  },
};

/** Phones in selection mode (design MobInboxSelect). */
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("radio", { name: UNREAD_REGEX })
    ).toBeDisabled();
  },
};
