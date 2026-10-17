import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { DashboardAccessDenied } from "./dashboard-access-denied";
import { defaultDashboardAccessDeniedArgs } from "./dashboard-shell.mock";

const meta = {
  args: { ...defaultDashboardAccessDeniedArgs, onGoToLogin: fn() },
  argTypes: {
    onGoToLogin: {
      description: "Sign in clicked (page navigates to /sign-in)",
    },
  },
  component: DashboardAccessDenied,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "Blocks/DashboardShell/AccessDenied",
} satisfies Meta<typeof DashboardAccessDenied>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByRole("heading", { name: "Sign in to see your inbox" })
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));
    await expect(args.onGoToLogin).toHaveBeenCalledOnce();
  },
};
