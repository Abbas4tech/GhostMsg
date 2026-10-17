import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { defaultHoverCardArgs, hoverCardMockContent } from "./hover-card.mock";

const meta = {
  args: { ...defaultHoverCardArgs, onOpenChange: fn() },
  argTypes: {
    defaultOpen: { control: "boolean", description: "Open on mount" },
    onOpenChange: { description: "Called when the card shows or hides" },
  },
  component: HoverCard,
  parameters: { layout: "centered" },
  render: (args) => (
    <HoverCard {...args}>
      <HoverCardTrigger asChild>
        <a className="underline" href="/safety">
          {hoverCardMockContent.trigger}
        </a>
      </HoverCardTrigger>
      <HoverCardContent>{hoverCardMockContent.content}</HoverCardContent>
    </HoverCard>
  ),
  tags: ["autodocs"],
  title: "Elements/HoverCard",
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnHover: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.hover(
      canvas.getByRole("link", { name: hoverCardMockContent.trigger })
    );
    await expect(
      await screen.findByText(hoverCardMockContent.content)
    ).toBeVisible();
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);
  },
};

export const Open: Story = { args: { defaultOpen: true } };
