import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Check, Mail } from "lucide-react";
import { expect } from "storybook/test";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";
import {
  defaultInputGroupArgs,
  inputGroupMockContent,
} from "./input-group.mock";

const meta = {
  title: "Elements/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: defaultInputGroupArgs,
  argTypes: {
    tone: {
      control: "radio",
      options: ["default", "success"],
      description: "Validation tone of the border",
    },
    size: {
      control: "radio",
      options: ["default", "lg"],
      description: "Height",
    },
    shape: {
      control: "radio",
      options: ["default", "pill"],
      description: "Corner style",
    },
  },
  render: (args) => (
    <div className="flex max-w-sm flex-col gap-1.5">
      <label className="font-semibold text-sm" htmlFor="input-group-demo">
        {inputGroupMockContent.label}
      </label>
      <InputGroup {...args}>
        <InputGroupAddon>
          <Mail aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          id="input-group-demo"
          placeholder={inputGroupMockContent.placeholder}
        />
        {args.tone === "success" ? (
          <InputGroupAddon align="inline-end">
            <Check aria-hidden="true" />
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    </div>
  ),
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Typing: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText("Email");
    await userEvent.type(input, "maya@example.com");
    await expect(input).toHaveValue("maya@example.com");
  },
};

export const Success: Story = { args: { tone: "success" } };

export const Large: Story = { args: { size: "lg" } };

export const Pill: Story = { args: { shape: "pill" } };
