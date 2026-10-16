import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { SectionNav } from "./section-nav";
import { defaultSectionNavArgs } from "./section-nav.mock";

const meta = {
  title: "Patterns/SectionNav",
  component: SectionNav,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[180px]">
        <Story />
      </div>
    ),
  ],
  args: defaultSectionNavArgs,
  argTypes: {
    items: { control: "object", description: "Section ids and labels" },
    activeId: {
      control: "select",
      options: defaultSectionNavArgs.items.map((item) => item.id),
      description: "Section in view (scroll-spy)",
    },
  },
} satisfies Meta<typeof SectionNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const nav = canvas.getByRole("navigation", { name: "On this page" });
    await expect(
      within(nav).getByRole("link", { name: "Safety & blocking" })
    ).toHaveAttribute("aria-current", "true");
    await expect(
      within(nav).getByRole("link", { name: "Messages" })
    ).toHaveAttribute("href", "#messages");
  },
};

export const NoneActive: Story = { args: { activeId: undefined } };
