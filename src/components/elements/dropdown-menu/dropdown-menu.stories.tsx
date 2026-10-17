import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, waitFor } from "storybook/test";
import { Button } from "@/components/elements/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  defaultDropdownMenuArgs,
  dropdownMenuMockContent,
} from "./dropdown-menu.mock";

const onSelectItem = fn();

const selectItemHandlers = new Map(
  dropdownMenuMockContent.items.map(
    (item) => [item, () => onSelectItem(item)] as const
  )
);

const meta = {
  args: { ...defaultDropdownMenuArgs, onOpenChange: fn() },
  argTypes: {
    modal: {
      control: "boolean",
      description: "Hide the rest of the page while open",
    },
    onOpenChange: { description: "Called when the menu opens or closes" },
  },
  component: DropdownMenu,
  parameters: { layout: "centered" },
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{dropdownMenuMockContent.trigger}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{dropdownMenuMockContent.label}</DropdownMenuLabel>
        {dropdownMenuMockContent.items.map((item) => (
          <DropdownMenuItem key={item} onSelect={selectItemHandlers.get(item)}>
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  tags: ["autodocs"],
  title: "Elements/DropdownMenu",
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PickItem: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Export" }));
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "JSON" })
    );
    await expect(onSelectItem).toHaveBeenCalledWith("JSON");
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  },
};
