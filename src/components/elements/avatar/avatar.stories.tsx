import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Avatar, AvatarFallback } from "./avatar";
import { AVATAR_SIZES, avatarMockContent } from "./avatar.mock";

const meta = {
  title: "Elements/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { size: "default" },
  argTypes: {
    size: {
      control: "radio",
      options: AVATAR_SIZES,
      description: "Diameter",
    },
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>{avatarMockContent.name.charAt(0)}</AvatarFallback>
    </Avatar>
  ),
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("m")).toHaveAttribute(
      "data-slot",
      "avatar-fallback"
    );
  },
};

export const Brand: Story = {
  args: { size: "xl" },
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback variant="brand">
        {avatarMockContent.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-3">
      {AVATAR_SIZES.map((size) => (
        <Avatar key={size} size={size}>
          <AvatarFallback variant="brand">M</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};
