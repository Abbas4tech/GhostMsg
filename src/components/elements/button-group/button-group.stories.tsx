import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Button } from "@/components/elements/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "./button-group";
import {
  BUTTON_GROUP_ORIENTATIONS,
  defaultButtonGroupArgs,
} from "./button-group.mock";

const meta = {
  args: defaultButtonGroupArgs,
  argTypes: {
    orientation: {
      control: "radio",
      description: "Layout direction",
      options: BUTTON_GROUP_ORIENTATIONS,
    },
  },
  component: ButtonGroup,
  parameters: { layout: "centered" },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">CSV</Button>
      <Button variant="outline">JSON</Button>
    </ButtonGroup>
  ),
  tags: ["autodocs"],
  title: "Elements/ButtonGroup",
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "CSV" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "JSON" })).toBeVisible();
  },
};

export const Vertical: Story = { args: { orientation: "vertical" } };

export const WithTextAndSeparator: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">3 selected</Button>
      <ButtonGroupSeparator />
      <ButtonGroupText>Bulk actions</ButtonGroupText>
    </ButtonGroup>
  ),
};
