import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen, within } from "storybook/test";
import { sweetMessage } from "@/mock/fixtures/messages.fixtures";
import { defaultStoryCardModalArgs } from "./modals.mock";
import { StoryCardModal } from "./story-card-modal";

/** Story Card export: canvas preview + format/look/content toggles. */
const meta = {
  args: { ...defaultStoryCardModalArgs, onClose: fn(), onCopyLink: fn() },
  argTypes: {
    isOpen: { control: "boolean", description: "Dialog visibility" },
    message: {
      control: "object",
      description: "Message (and answer, if any) drawn onto the card",
    },
    onClose: { description: "Escape / overlay / close" },
    onCopyLink: { description: "Copy my link clicked" },
    profileLabel: { control: "text", description: "Footer link" },
    username: { control: "text", description: "Handle printed on the card" },
  },
  component: StoryCardModal,
  tags: ["autodocs"],
  title: "Patterns/Modals/StoryCardModal",
} satisfies Meta<typeof StoryCardModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAnswer: Story = {
  play: async ({ args, userEvent }) => {
    const dialog = await screen.findByRole("dialog", {
      name: "Share as Story Card",
    });
    await expect(
      within(dialog).getByRole("img", { name: "Story Card preview" })
    ).toBeVisible();

    const square = within(dialog).getByRole("button", { name: "Square 1:1" });
    await userEvent.click(square);
    await expect(square).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(
      within(dialog).getByRole("switch", { name: "Include my answer" })
    );
    await expect(
      within(dialog).getByRole("switch", { name: "Include my answer" })
    ).not.toBeChecked();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Copy my link" })
    );
    await expect(args.onCopyLink).toHaveBeenCalledOnce();
    await expect(
      within(dialog).getByRole("button", { name: "Save image" })
    ).toBeEnabled();
  },
};

export const WithoutAnswer: Story = {
  args: { message: sweetMessage },
  play: async () => {
    const dialog = await screen.findByRole("dialog");
    await expect(
      within(dialog).queryByRole("switch", { name: "Include my answer" })
    ).not.toBeInTheDocument();
  },
};

export const ClosesOnEscape: Story = {
  play: async ({ args, userEvent }) => {
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalled();
  },
};
