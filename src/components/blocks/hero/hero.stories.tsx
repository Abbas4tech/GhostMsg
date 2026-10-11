import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { MessagesCarousel } from "@/components/patterns/messages-carousel";
import { carouselScenarios } from "@/mock/fixtures/carousel.fixtures";
import { Hero } from "./hero";
import { defaultHeroArgs } from "./hero.mock";

const meta = {
  title: "Blocks/Hero",
  component: Hero,
  tags: ["autodocs"],
  args: defaultHeroArgs,
  argTypes: {
    title: { control: "text", description: "Page h1" },
    description: { control: "text", description: "Lead paragraph" },
    children: {
      control: false,
      description: "Showcase slot (e.g. MessagesCarousel)",
    },
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCarousel: Story = {
  args: { children: <MessagesCarousel messages={carouselScenarios.default} /> },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", {
        level: 1,
        name: defaultHeroArgs.title as string,
      })
    ).toBeVisible();
    await expect(
      canvas.getByText(defaultHeroArgs.description as string)
    ).toBeVisible();
    await expect(canvas.getAllByRole("group")).toHaveLength(
      carouselScenarios.default.length
    );
  },
};

export const CopyOnly: Story = {};

export const Mobile: Story = {
  args: { children: <MessagesCarousel messages={carouselScenarios.default} /> },
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
