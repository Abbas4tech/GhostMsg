import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Button } from "@/components/elements/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import {
  CARD_SIZES,
  CARD_VARIANTS,
  cardMockContent,
  defaultCardArgs,
} from "./card.mock";

const meta = {
  args: defaultCardArgs,
  argTypes: {
    size: {
      control: "radio",
      description: "Vertical padding/gap preset",
      options: CARD_SIZES,
    },
    variant: {
      control: "select",
      description: "Surface style. `default` is the original shadcn card.",
      options: CARD_VARIANTS,
    },
  },
  component: Card,
  parameters: { layout: "centered" },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>{cardMockContent.title}</CardTitle>
        <CardDescription>{cardMockContent.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{cardMockContent.body}</p>
      </CardContent>
      <CardFooter>
        <span className="text-muted-foreground text-xs">
          {cardMockContent.footer}
        </span>
      </CardFooter>
    </Card>
  ),
  tags: ["autodocs"],
  title: "Elements/Card",
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText(cardMockContent.title)).toBeVisible();
    await expect(canvas.getByText(cardMockContent.description)).toBeVisible();
    await expect(canvas.getByText(cardMockContent.body)).toBeVisible();
  },
};

export const Glass: Story = {
  args: { variant: "glass" },
  decorators: [
    (Story) => (
      <div className="rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 p-8">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { disable: true },
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-slot="card"]')).toHaveClass(
      "backdrop-blur-md"
    );
  },
};

export const Ghost: Story = { args: { variant: "ghost" } };
export const Bordered: Story = { args: { variant: "bordered" } };
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };

export const WithHeaderAction: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>{cardMockContent.title}</CardTitle>
        <CardDescription>{cardMockContent.description}</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Refresh
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{cardMockContent.body}</p>
      </CardContent>
    </Card>
  ),
};

export const LongContent: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>
          A very long card title that needs to wrap onto multiple lines
        </CardTitle>
        <CardDescription>{cardMockContent.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{`${cardMockContent.body} `.repeat(8)}</p>
      </CardContent>
    </Card>
  ),
};
