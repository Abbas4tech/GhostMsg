import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Input } from "@/components/elements/input";
import { Field, FieldDescription, FieldError, FieldLabel } from "./field";
import { FIELD_ORIENTATIONS, fieldMockContent } from "./field.mock";

const meta = {
  title: "Elements/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { orientation: "vertical" },
  argTypes: {
    orientation: {
      control: "radio",
      options: FIELD_ORIENTATIONS,
      description: "Label/control layout",
    },
  },
  render: (args) => (
    <Field {...args} className="max-w-sm">
      <FieldLabel htmlFor="field-demo">{fieldMockContent.label}</FieldLabel>
      <Input id="field-demo" />
      <FieldDescription>{fieldMockContent.description}</FieldDescription>
    </Field>
  ),
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText(fieldMockContent.label);
    await userEvent.type(input, "Maya");
    await expect(input).toHaveValue("Maya");
  },
};

export const Invalid: Story = {
  render: (args) => (
    <Field {...args} className="max-w-sm" data-invalid>
      <FieldLabel htmlFor="field-invalid">{fieldMockContent.label}</FieldLabel>
      <Input aria-invalid id="field-invalid" />
      <FieldError>{fieldMockContent.error}</FieldError>
    </Field>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      fieldMockContent.error
    );
  },
};
