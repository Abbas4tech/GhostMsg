import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Text } from "./text";
import { defaultTextArgs, TEXT_VARIANTS } from "./text.mock";

const HEADING_TAGS: Partial<
  Record<(typeof TEXT_VARIANTS)[number], "h1" | "h2" | "h3" | "h4">
> = {
  h1: "h1",
  h2: "h2",
  "h2-underline": "h2",
  h3: "h3",
  h4: "h4",
};

const meta = {
  title: "Elements/Text",
  component: Text,
  tags: ["autodocs"],
  args: defaultTextArgs,
  argTypes: {
    variant: {
      control: "select",
      options: TEXT_VARIANTS,
      description: "Typography preset",
    },
    as: { control: "text", description: "Rendered element (`p` by default)" },
    children: { control: "text", description: "Text content" },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Heading1: Story = {
  args: { as: "h1", variant: "h1" },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Send Messages like a Ghost."
    );
  },
};

export const Lead: Story = {
  args: {
    variant: "lead",
    children:
      "GhostMsg lets you send anonymous messages that appear out of nowhere.",
  },
};

export const Muted: Story = {
  args: { variant: "muted", children: "Continue your journey with GhostMsg" },
};

export const TypeScale: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="space-y-4">
      {TEXT_VARIANTS.map((variant) => (
        <Text as={HEADING_TAGS[variant] ?? "p"} key={variant} variant={variant}>
          {variant}: The quick ghost jumps over the lazy inbox
        </Text>
      ))}
    </div>
  ),
};
