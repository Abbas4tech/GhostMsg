import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, screen } from "storybook/test";
import { ChangeUsernameModal } from "./change-username-modal";
import { defaultChangeUsernameModalArgs } from "./modals.mock";

const meta = {
  args: {
    ...defaultChangeUsernameModalArgs,
    onOpenChange: fn(),
    onSubmit: fn(),
    onValueChange: fn(),
  },
  argTypes: {
    availability: {
      control: "radio",
      description: "Debounced availability check",
      options: ["idle", "checking", "available", "taken"],
    },
    errorMessage: { control: "text", description: "Server/validation error" },
    isSaving: { control: "boolean", description: "Spinner, Save disabled" },
    linkPrefix: { control: "text", description: "Shown before the input" },
    onOpenChange: { description: "Cancel / Escape / overlay" },
    onSubmit: { description: "Change username (only when available)" },
    onValueChange: { description: "Input changed → value" },
    open: { control: "boolean", description: "Dialog visibility" },
    value: { control: "text", description: "Controlled new username" },
  },
  component: ChangeUsernameModal,
  tags: ["autodocs"],
  title: "Patterns/Modals/ChangeUsernameModal",
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
