import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { toast } from "sonner";
import { expect, screen, waitFor } from "storybook/test";
import { Button } from "@/components/elements/button";
import { Toaster } from "./sonner";
import { toastMockMessages } from "./sonner.mock";

const handleSuccessToast = () => toast.success(toastMockMessages.success);
const handleErrorToast = () => toast.error(toastMockMessages.error);
const handleInfoToast = () =>
  toast.info(toastMockMessages.info, {
    description: toastMockMessages.description,
  });

/**
 * The global `<Toaster/>` is mounted by `.storybook/preview.tsx` (like the app
 * root layout), so stories only trigger toasts.
 */
function ToastTriggers() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={handleSuccessToast}>Success</Button>
      <Button onClick={handleErrorToast} variant="destructive">
        Error
      </Button>
      <Button onClick={handleInfoToast} variant="outline">
        Info with description
      </Button>
    </div>
  );
}

const meta = {
  component: Toaster,
  parameters: { layout: "centered" },
  render: () => <ToastTriggers />,
  tags: ["autodocs"],
  title: "Elements/Toaster",
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
