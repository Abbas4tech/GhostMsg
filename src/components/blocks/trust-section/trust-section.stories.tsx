import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { TrustSection } from "./trust-section";
import { defaultTrustSectionArgs } from "./trust-section.mock";

const meta = {
  args: defaultTrustSectionArgs,
  argTypes: { id: { control: "text", description: "Anchor id" } },
  component: TrustSection,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "Blocks/TrustSection",
} satisfies Meta<typeof TrustSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreePromises: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 2, name: "Safe by default" })
    ).toBeInTheDocument();
    await expect(canvas.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    await expect(
      canvas.getByRole("heading", { level: 3, name: "Senders stay anonymous" })
    ).toBeVisible();
  },
};

/** Design MobLanding: a visible "Safe by default" over three icon rows. */
export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 2, name: "Safe by default" })
    ).toBeVisible();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
  },
};
