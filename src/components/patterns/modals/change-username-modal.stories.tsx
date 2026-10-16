import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { ChangeUsernameModal } from "./change-username-modal";
import { defaultChangeUsernameModalArgs } from "./modals.mock";

const meta = {
  title: "Patterns/Modals/ChangeUsernameModal",
  component: ChangeUsernameModal,
  tags: ["autodocs"],
  args: {
    ...defaultChangeUsernameModalArgs,
    onOpenChange: fn(),
    onSubmit: fn(),
    onValueChange: fn(),
  },
  argTypes: {
    open: { control: "boolean", description: "Dialog visibility" },
    value: { control: "text", description: "Controlled new username" },
    availability: {
      control: "radio",
      options: ["idle", "checking", "available", "taken"],
      description: "Debounced availability check",
    },
    errorMessage: { control: "text", description: "Server/validation error" },
    linkPrefix: { control: "text", description: "Shown before the input" },
    isSaving: { control: "boolean", description: "Spinner, Save disabled" },
    onValueChange: { description: "Input changed → value" },
    onSubmit: { description: "Change username (only when available)" },
    onOpenChange: { description: "Cancel / Escape / overlay" },
  },
} satisfies Meta<typeof ChangeUsernameModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = {
  play: async ({ args, userEvent }) => {
    const dialog = await screen.findByRole("dialog", {
      name: "Change your username",
    });
    await expect(dialog).toBeVisible();
    await expect(
      screen.getByRole("img", { name: "Username is available" })
    ).toBeVisible();
    await userEvent.type(screen.getByLabelText("New username"), "x");
    await expect(args.onValueChange).toHaveBeenCalled();
    await userEvent.click(
      screen.getByRole("button", { name: "Change username" })
    );
    await expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

export const Taken: Story = {
  args: { availability: "taken" },
  play: async () => {
    await expect(
      await screen.findByText("Username is already taken")
    ).toBeVisible();
    await expect(screen.getByLabelText("New username")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    await expect(
      screen.getByRole("button", { name: "Change username" })
    ).toBeDisabled();
  },
};

export const Checking: Story = {
  args: { availability: "checking" },
  play: async () => {
    await expect(
      await screen.findByRole("button", { name: "Change username" })
    ).toBeDisabled();
  },
};

export const Cancels: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.click(
      await screen.findByRole("button", { name: "Cancel" })
    );
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
};
