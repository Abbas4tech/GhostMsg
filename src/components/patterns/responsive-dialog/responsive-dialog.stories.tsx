import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { Button } from "@/components/elements/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "./responsive-dialog";
import { responsiveDialogMock } from "./responsive-dialog.mock";

const meta = {
  args: {
    children: null,
    onOpenChange: fn(),
    open: responsiveDialogMock.open,
  },
  argTypes: {
    children: { control: false, description: "Content parts" },
    onOpenChange: { description: "Escape / overlay / swipe down → false" },
    open: { control: "boolean", description: "Visibility" },
  },
  component: ResponsiveDialog,
  render: (args) => (
    <ResponsiveDialog onOpenChange={args.onOpenChange} open={args.open}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>
            {responsiveDialogMock.title}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {responsiveDialogMock.description}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <Button className="rounded-full" variant="outline">
            {responsiveDialogMock.cancel}
          </Button>
          <Button className="rounded-full">
            {responsiveDialogMock.confirm}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  ),
  tags: ["autodocs"],
  title: "Patterns/ResponsiveDialog",
} satisfies Meta<typeof ResponsiveDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** ≥768px: a centred Dialog with its corner close. */
export const Desktop: Story = {
  play: async ({ args, userEvent }) => {
    await expect(
      await screen.findByRole("dialog", { name: responsiveDialogMock.title })
    ).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};

/** Below 768px: a bottom Drawer, primary action first and 52px tall. */
export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
  play: async () => {
    await expect(
      await screen.findByRole("dialog", { name: responsiveDialogMock.title })
    ).toBeVisible();
  },
};
