import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Card, CardContent } from "@/components/elements/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";
import { carouselMockSlides, defaultCarouselArgs } from "./carousel.mock";

const meta = {
  title: "Elements/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: defaultCarouselArgs,
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Scroll axis",
    },
    opts: {
      control: "object",
      description: "Embla options (e.g. `{ loop: true }`)",
    },
  },
  render: (args) => (
    <Carousel {...args} className="mx-14 w-64">
      <CarouselContent>
        {carouselMockSlides.map((label) => (
          <CarouselItem key={label}>
            <Card>
              <CardContent className="flex aspect-square items-center justify-center font-semibold text-3xl">
                {label}
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const previous = canvas.getByRole("button", { name: "Previous slide" });
    const next = canvas.getByRole("button", { name: "Next slide" });
    await expect(previous).toBeDisabled();
    await userEvent.click(next);
    await expect(previous).toBeEnabled();
  },
};

export const Looping: Story = {
  args: { opts: { loop: true } },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Previous slide" })
    ).toBeEnabled();
  },
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <Carousel {...args} className="my-14 w-64">
      <CarouselContent className="h-64">
        {carouselMockSlides.map((label) => (
          <CarouselItem key={label}>
            <Card>
              <CardContent className="flex h-56 items-center justify-center font-semibold text-3xl">
                {label}
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};
