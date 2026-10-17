import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { Button } from "@/components/elements/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";
import { defaultPopoverArgs, popoverMockContent } from "./popover.mock";

const meta = {
  args: { ...defaultPopoverArgs, onOpenChange: fn() },
  argTypes: {
    defaultOpen: { control: "boolean", description: "Open on mount" },
    onOpenChange: { description: "Called when the popover opens or closes" },
  },
  component: Popover,
  parameters: { layout: "centered" },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="outline">{popoverMockContent.trigger}</Button>
      </PopoverTrigger>
      <PopoverContent aria-labelledby="popover-story-title">
        <PopoverHeader>
          <PopoverTitle id="popover-story-title">
            {popoverMockContent.title}
          </PopoverTitle>
          <PopoverDescription>
            {popoverMockContent.description}
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
  tags: ["autodocs"],
  title: "Elements/Popover",
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenAndClose: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: popoverMockContent.trigger })
    );
    await expect(
      await screen.findByText(popoverMockContent.title)
    ).toBeVisible();
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);
  },
};

export const Open: Story = { args: { defaultOpen: true } };
