import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { commandMockContent } from "./command.mock";

const meta = {
  title: "Elements/Command",
  component: Command,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { label: commandMockContent.label },
  render: (args) => (
    <Command {...args} className="w-80 rounded-xl border">
      <CommandInput placeholder={commandMockContent.placeholder} />
      <CommandList>
        <CommandEmpty>{commandMockContent.empty}</CommandEmpty>
        {commandMockContent.groups.map((group) => (
          <CommandGroup heading={group.heading} key={group.heading}>
            {group.items.map((item) => (
              <CommandItem key={item}>{item}</CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  ),
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole("combobox", { name: commandMockContent.label }),
      "prof"
    );
    await expect(
      canvas.getByRole("option", { name: "Profile" })
    ).toHaveAttribute("aria-selected", "true");
  },
};
