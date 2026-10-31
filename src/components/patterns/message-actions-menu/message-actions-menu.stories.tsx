import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Archive, Ban, Share, Trash2 } from "lucide-react";
import { expect, fn, screen } from "storybook/test";
import { MessageActionsMenu } from "./message-actions-menu";
import { messageActionsMock } from "./message-actions-menu.mock";

const onArchive = fn();
const onDelete = fn();

const meta = {
  args: {
    actions: [
      {
        ...messageActionsMock.story,
        icon: <Share />,
      },
      {
        ...messageActionsMock.archive,
        icon: <Archive />,
        onClick: onArchive,
      },
      {
        ...messageActionsMock.block,
        icon: <Ban />,
        startsGroup: true,
      },
      {
        ...messageActionsMock.delete,
        icon: <Trash2 />,
        onClick: onDelete,
      },
    ],
    label: "Message actions",
    preview: "“I think you're way funnier than you let on.”",
  },
  argTypes: {
    actions: { control: false, description: "Items, in order" },
    label: {
      control: "text",
      description: "Trigger name and phone Drawer title",
    },
    preview: { control: "text", description: "Phones: one-line summary" },
  },
  component: MessageActionsMenu,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Patterns/MessageActionsMenu",
} satisfies Meta<typeof MessageActionsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Desktop: a DropdownMenu. */
export const Desktop: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Message actions" })
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Archive" })
    );
    await expect(onArchive).toHaveBeenCalled();
  },
};

/** Phones (design MobDrawerActions): a bottom Drawer with 56px rows. */
export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Message actions" })
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Delete" })
    );
    await expect(onDelete).toHaveBeenCalled();
  },
};
