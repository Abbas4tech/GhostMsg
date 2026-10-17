import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, waitFor } from "storybook/test";
import { Button } from "@/components/elements/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import {
  alertDialogMockContent,
  defaultAlertDialogArgs,
} from "./alert-dialog.mock";

const meta = {
  args: { ...defaultAlertDialogArgs, onOpenChange: fn() },
  argTypes: {
    defaultOpen: {
      control: "boolean",
      description: "Open on mount (uncontrolled)",
    },
    onOpenChange: { description: "Called when the dialog opens or closes" },
    open: { control: "boolean", description: "Controlled open state" },
  },
  component: AlertDialog,
  parameters: { layout: "centered" },
  render: (args) => (
    <AlertDialog {...args}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">{alertDialogMockContent.trigger}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{alertDialogMockContent.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {alertDialogMockContent.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{alertDialogMockContent.cancel}</AlertDialogCancel>
          <AlertDialogAction>
            {alertDialogMockContent.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  tags: ["autodocs"],
  title: "Elements/AlertDialog",
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: alertDialogMockContent.trigger })
    );
    const dialog = await screen.findByRole("alertdialog");
    await expect(dialog).toHaveAccessibleName(alertDialogMockContent.title);
    await waitFor(() =>
      expect(screen.getByText(alertDialogMockContent.description)).toBeVisible()
    );
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);

    await userEvent.click(
      screen.getByRole("button", { name: alertDialogMockContent.cancel })
    );
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    );
  },
};

export const OpenByDefault: Story = {
  args: { defaultOpen: true },
  play: async () => {
    await expect(await screen.findByRole("alertdialog")).toBeVisible();
  },
};
