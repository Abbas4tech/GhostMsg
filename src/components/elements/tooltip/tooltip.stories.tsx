import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { Button } from "@/components/elements/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { defaultTooltipArgs, tooltipMockContent } from "./tooltip.mock";

const meta = {
  title: "Elements/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { ...defaultTooltipArgs, onOpenChange: fn() },
  argTypes: {
    open: { control: "boolean", description: "Controlled open state" },
    delayDuration: { control: "number", description: "Hover delay in ms" },
    onOpenChange: { description: "Called when the tooltip shows or hides" },
  },
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline">{tooltipMockContent.trigger}</Button>
      </TooltipTrigger>
      <TooltipContent>{tooltipMockContent.content}</TooltipContent>
    </Tooltip>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnHover: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.hover(
      canvas.getByRole("button", { name: tooltipMockContent.trigger })
    );
    await expect(await screen.findByRole("tooltip")).toHaveTextContent(
      tooltipMockContent.content
    );
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);
  },
};

export const OnFocus: Story = {
  play: async ({ userEvent }) => {
    await userEvent.tab();
    await expect(await screen.findByRole("tooltip")).toHaveTextContent(
      tooltipMockContent.content
    );
  },
};

export const Open: Story = { args: { open: true } };
