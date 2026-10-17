import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { defaultTabsArgs, tabsMockItems } from "./tabs.mock";

const meta = {
  args: { ...defaultTabsArgs, onValueChange: fn() },
  argTypes: {
    defaultValue: {
      control: "select",
      description: "Initially selected tab (uncontrolled)",
      options: tabsMockItems.map((item) => item.value),
    },
    onValueChange: { description: "Called with the newly selected tab value" },
  },
  component: Tabs,
  render: (args) => (
    <Tabs {...args} className="w-[28rem]">
      <TabsList className="grid grid-cols-3">
        {tabsMockItems.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabsMockItems.map((item) => (
        <TabsContent
          className="p-4 text-sm"
          key={item.value}
          value={item.value}
        >
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  ),
  tags: ["autodocs"],
  title: "Elements/Tabs",
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const messages = canvas.getByRole("tab", { name: "Messages" });
    const settings = canvas.getByRole("tab", { name: "Settings" });
    await expect(messages).toHaveAttribute("aria-selected", "true");

    await userEvent.click(settings);
    await expect(args.onValueChange).toHaveBeenCalledWith("settings");
    await expect(settings).toHaveAttribute("aria-selected", "true");
    await expect(
      await canvas.findByText("Manage notifications.")
    ).toBeVisible();
  },
};

export const ProfileSelected: Story = { args: { defaultValue: "profile" } };

export const KeyboardNavigation: Story = {
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole("tab", { name: "Messages" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Profile" })).toHaveFocus();
  },
};
