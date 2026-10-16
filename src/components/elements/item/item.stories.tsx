import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Button } from "@/components/elements/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "./item";
import { ITEM_SIZES, ITEM_VARIANTS, itemMockContent } from "./item.mock";

const meta = {
  args: { size: "default", variant: "outline" },
  argTypes: {
    size: { control: "radio", description: "Padding", options: ITEM_SIZES },
    variant: {
      control: "radio",
      description: "Surface",
      options: ITEM_VARIANTS,
    },
  },
  component: Item,
  parameters: { layout: "padded" },
  render: (args) => (
    <Item {...args} className="max-w-sm">
      <ItemContent>
        <ItemTitle>{itemMockContent.title}</ItemTitle>
        <ItemDescription>{itemMockContent.description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          {itemMockContent.action}
        </Button>
      </ItemActions>
    </Item>
  ),
  tags: ["autodocs"],
  title: "Elements/Item",
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText(itemMockContent.title)).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: itemMockContent.action })
    ).toBeVisible();
  },
};

export const Muted: Story = { args: { size: "sm", variant: "muted" } };
