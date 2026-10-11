import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { toast } from "sonner";
import { expect, screen, waitFor } from "storybook/test";
import { Button } from "@/components/elements/button";
import { Toaster } from "./sonner";
import { toastMockMessages } from "./sonner.mock";

/**
 * The global `<Toaster/>` is mounted by `.storybook/preview.tsx` (like the app
 * root layout), so stories only trigger toasts.
 */
function ToastTriggers() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast.success(toastMockMessages.success)}>
        Success
      </Button>
      <Button
        onClick={() => toast.error(toastMockMessages.error)}
        variant="destructive"
      >
        Error
      </Button>
      <Button
        onClick={() =>
          toast.info(toastMockMessages.info, {
            description: toastMockMessages.description,
          })
        }
        variant="outline"
      >
        Info with description
      </Button>
    </div>
  );
}

const meta = {
  title: "Elements/Toaster",
  component: Toaster,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  render: () => <ToastTriggers />,
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Success" }));
    await waitFor(() =>
      expect(screen.getByText(toastMockMessages.success)).toBeVisible()
    );
  },
};

export const ErrorToast: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Error" }));
    await waitFor(() =>
      expect(screen.getByText(toastMockMessages.error)).toBeVisible()
    );
  },
};

export const WithDescription: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Info with description" })
    );
    await waitFor(() =>
      expect(screen.getByText(toastMockMessages.description)).toBeVisible()
    );
  },
};
