import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { carouselScenarios } from "@/mock/fixtures/carousel.fixtures";
import { MessagesCarousel } from "./messages-carousel";
import {
  defaultMessagesCarouselArgs,
  singleMessagesCarouselArgs,
} from "./messages-carousel.mock";

const meta = {
  title: "Patterns/MessagesCarousel",
  component: MessagesCarousel,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-5xl">
        <Story />
      </div>
    ),
  ],
  args: defaultMessagesCarouselArgs,
  argTypes: {
    messages: {
      control: "object",
      description: "Sample messages (landing page)",
    },
    autoplayDelay: {
      control: { type: "number", min: 1000, step: 500 },
      description: "Autoplay interval in ms",
    },
  },
} satisfies Meta<typeof MessagesCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const slides = canvas.getAllByRole("group");
    await expect(slides).toHaveLength(carouselScenarios.default.length);
    await expect(slides[0]).toHaveAttribute("aria-roledescription", "slide");
    await expect(
      canvas.getByText(carouselScenarios.default[0].content)
    ).toBeInTheDocument();
  },
};

export const SingleMessage: Story = { args: singleMessagesCarouselArgs };

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
