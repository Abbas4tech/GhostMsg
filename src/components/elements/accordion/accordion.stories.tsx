import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";
import { accordionMockItems } from "./accordion.mock";

/** shadcn Accordion: Settings on phones (one section open at a time or many). */
const meta = {
  args: { collapsible: true, type: "single" },
  argTypes: {
    collapsible: {
      control: "boolean",
      description: "Single mode: the open item can be closed again",
    },
    type: {
      control: "radio",
      description: "One open item or many",
      options: ["single", "multiple"],
    },
  },
  component: Accordion,
  parameters: { layout: "padded" },
  render: (args) => (
    <Accordion {...args} className="max-w-md">
      {accordionMockItems.map(({ content, title, value }) => (
        <AccordionItem key={value} value={value}>
          <AccordionTrigger>{title}</AccordionTrigger>
          <AccordionContent>{content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
  tags: ["autodocs"],
  title: "Elements/Accordion",
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const [FIRST] = accordionMockItems;

export const Single: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: FIRST.title });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText(FIRST.content)).toBeVisible();
  },
};

export const Multiple: Story = {
  args: { type: "multiple" },
};
