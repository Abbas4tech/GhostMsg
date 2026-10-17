import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { type SELECT_TRIGGER_SIZES, selectMockContent } from "./select.mock";

type TriggerSize = (typeof SELECT_TRIGGER_SIZES)[number];

const meta = {
  args: { defaultValue: "instant", onValueChange: fn() },
  argTypes: {
    defaultValue: {
      control: "select",
      description: "Initially selected value",
      options: selectMockContent.options.map((option) => option.value),
    },
    onValueChange: { description: "Called with the chosen value" },
  },
  component: Select,
  parameters: { layout: "centered" },
  render: (args, { parameters }) => (
    <Select {...args}>
      <SelectTrigger
        aria-label={selectMockContent.label}
        size={(parameters.triggerSize as TriggerSize | undefined) ?? "default"}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {selectMockContent.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  tags: ["autodocs"],
  title: "Elements/Select",
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const trigger = canvas.getByRole("combobox", {
      name: selectMockContent.label,
    });
    await expect(trigger).toHaveTextContent("Instant");
    await userEvent.click(trigger);
    await userEvent.click(
      await screen.findByRole("option", { name: "Daily digest" })
    );
    await expect(args.onValueChange).toHaveBeenCalledWith("daily");
  },
};

export const Large: Story = { parameters: { triggerSize: "lg" } };
