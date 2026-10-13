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
  title: "Elements/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: defaultCardArgs,
  argTypes: {
    variant: {
      control: "select",
      options: CARD_VARIANTS,
      description: "Surface style. `default` is the original shadcn card.",
    },
    size: {
      control: "radio",
      options: CARD_SIZES,
      description: "Vertical padding/gap preset",
    },
  },
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
  parameters: {
    backgrounds: { disable: true },
  },
  decorators: [
    (Story) => (
      <div className="rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 p-8">
        <Story />
      </div>
    ),
  ],
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
