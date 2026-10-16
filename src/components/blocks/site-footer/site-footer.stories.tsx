import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { SiteFooter } from "./site-footer";
import { defaultSiteFooterArgs } from "./site-footer.mock";

const meta = {
  title: "Blocks/SiteFooter",
  component: SiteFooter,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: defaultSiteFooterArgs,
} satisfies Meta<typeof SiteFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("navigation", { name: "Footer" })
    ).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Safety" })).toHaveAttribute(
      "href",
      "/#safety"
    );
  },
};
