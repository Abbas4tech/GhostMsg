import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { NotFoundPanel } from "./not-found-panel";
import { defaultNotFoundPanelArgs } from "./not-found-panel.mock";

const HOME_REGEX = /home/i;

const meta = {
  args: defaultNotFoundPanelArgs,
  argTypes: {
    homeHref: {
      control: "text",
      description: "Destination of the Home button",
    },
  },
  component: NotFoundPanel,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "Blocks/NotFoundPanel",
} satisfies Meta<typeof NotFoundPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("404")).toBeVisible();
    await expect(
      canvas.getByRole("heading", { name: "This page vanished like a ghost." })
    ).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: HOME_REGEX })
    ).toHaveAttribute("href", "/");
  },
};

export const CustomHome: Story = {
  args: { homeHref: "/dashboard" },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("link", { name: HOME_REGEX })
    ).toHaveAttribute("href", "/dashboard");
  },
};

export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
