import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { NotFoundPage } from "./not-found-page";

const HOME_REGEX = /home/i;

const meta = {
  component: NotFoundPage,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "Pages/NotFound",
} satisfies Meta<typeof NotFoundPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("404")).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: HOME_REGEX })
    ).toHaveAttribute("href", "/");
  },
};
