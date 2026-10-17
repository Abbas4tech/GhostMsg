import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, waitFor } from "storybook/test";
import { Button } from "@/components/elements/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { defaultDialogArgs, dialogMockContent } from "./dialog.mock";

const meta = {
  args: { ...defaultDialogArgs, onOpenChange: fn() },
  argTypes: {
    defaultOpen: {
      control: "boolean",
      description: "Open on mount (uncontrolled)",
    },
    onOpenChange: { description: "Called when the dialog opens or closes" },
    open: { control: "boolean", description: "Controlled open state" },
  },
  component: Dialog,
  parameters: { layout: "centered" },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">{dialogMockContent.trigger}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogMockContent.title}</DialogTitle>
          <DialogDescription>{dialogMockContent.description}</DialogDescription>
        </DialogHeader>
        <p className="text-sm">{dialogMockContent.body}</p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  tags: ["autodocs"],
  title: "Elements/Dialog",
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: dialogMockContent.trigger })
    );

    const dialog = await screen.findByRole("dialog");
    await expect(dialog).toHaveAccessibleName(dialogMockContent.title);
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};

export const OpenByDefault: Story = {
  args: { defaultOpen: true },
  play: async () => {
    await expect(await screen.findByRole("dialog")).toBeVisible();
  },
};

export const ClosesOnEscape: Story = {
  args: { defaultOpen: true },
  play: async ({ args, userEvent }) => {
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(args.onOpenChange).toHaveBeenCalledWith(false));
  },
};
