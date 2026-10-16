import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { DashboardSkeleton } from "./dashboard-skeleton";

const meta = {
  component: DashboardSkeleton,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "Blocks/DashboardShell/Skeleton",
} satisfies Meta<typeof DashboardSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(5);
  },
};

export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
