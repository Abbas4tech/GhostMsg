import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, waitFor } from "storybook/test";
import { Button } from "@/components/elements/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import { defaultDrawerArgs, drawerMockContent } from "./drawer.mock";

const meta = {
  args: { ...defaultDrawerArgs, onOpenChange: fn() },
  argTypes: {
    defaultOpen: { control: "boolean", description: "Open on mount" },
    onOpenChange: { description: "Called when the drawer opens or closes" },
  },
  component: Drawer,
  parameters: { layout: "centered" },
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger asChild>
        <Button variant="outline">{drawerMockContent.trigger}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{drawerMockContent.title}</DrawerTitle>
          <DrawerDescription>{drawerMockContent.description}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
  tags: ["autodocs"],
  title: "Elements/Drawer",
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenAndClose: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: drawerMockContent.trigger })
    );
    await expect(
      await screen.findByRole("dialog", { name: drawerMockContent.title })
    ).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
