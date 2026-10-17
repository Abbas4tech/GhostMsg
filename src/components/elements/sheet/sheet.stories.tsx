import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, waitFor } from "storybook/test";
import { Button } from "@/components/elements/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { defaultSheetArgs, sheetMockContent } from "./sheet.mock";

const meta = {
  args: { ...defaultSheetArgs, onOpenChange: fn() },
  argTypes: {
    defaultOpen: { control: "boolean", description: "Open on mount" },
    onOpenChange: { description: "Called when the sheet opens or closes" },
  },
  component: Sheet,
  parameters: { layout: "centered" },
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="outline">{sheetMockContent.trigger}</Button>
      </SheetTrigger>
      <SheetContent className="p-6" side="right">
        <SheetTitle>{sheetMockContent.title}</SheetTitle>
        <SheetDescription>{sheetMockContent.description}</SheetDescription>
      </SheetContent>
    </Sheet>
  ),
  tags: ["autodocs"],
  title: "Elements/Sheet",
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenAndClose: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open menu" }));
    await expect(
      await screen.findByRole("dialog", { name: "Menu" })
    ).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
