import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useCallback, useState } from "react";
import { expect, fn, screen } from "storybook/test";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import {
  DeleteAccountModal,
  type DeleteAccountModalProps,
} from "./delete-account-modal";
import { defaultDeleteAccountModalArgs } from "./modals.mock";

const DELETE_ACCOUNT_REGEX = /delete account/i;

/** Local state keeps the confirmation input interactive. */
function StatefulDeleteAccountModal(args: DeleteAccountModalProps) {
  const [confirmValue, setConfirmValue] = useState(args.confirmValue);
  const handleConfirmValueChange = useCallback(
    (next: string) => {
      args.onConfirmValueChange(next);
      setConfirmValue(next);
    },
    [args]
  );
  return (
    <DeleteAccountModal
      {...args}
      confirmValue={confirmValue}
      onConfirmValueChange={handleConfirmValueChange}
    />
  );
}

const meta = {
  args: {
    ...defaultDeleteAccountModalArgs,
    onConfirm: fn(),
    onConfirmValueChange: fn(),
    onOpenChange: fn(),
  },
  argTypes: {
    confirmValue: { control: "text", description: "Typed confirmation" },
    isPending: { control: "boolean", description: "Deleting (spinner)" },
    onConfirm: { description: "Delete account clicked" },
    onConfirmValueChange: { description: "Confirmation typed → value" },
    onOpenChange: { description: "Cancel / Escape" },
    open: { control: "boolean", description: "Dialog visibility" },
    username: { control: "text", description: "What must be typed" },
  },
  component: DeleteAccountModal,
  render: (args) => <StatefulDeleteAccountModal {...args} />,
  tags: ["autodocs"],
  title: "Patterns/Modals/DeleteAccountModal",
} satisfies Meta<typeof DeleteAccountModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypeToConfirm: Story = {
  play: async ({ args, userEvent }) => {
    await screen.findByRole("alertdialog", { name: "Delete your account?" });
    const confirm = screen.getByRole("button", { name: "Delete account" });
    await expect(confirm).toBeDisabled();

    await userEvent.type(
      screen.getByLabelText(`Type ${FIXTURE_USERNAME} to confirm`),
      FIXTURE_USERNAME
    );
    await expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    await expect(args.onConfirm).toHaveBeenCalledOnce();
  },
};

export const Pending: Story = {
  args: { confirmValue: FIXTURE_USERNAME, isPending: true },
  play: async () => {
    await expect(
      await screen.findByRole("button", { name: DELETE_ACCOUNT_REGEX })
    ).toBeDisabled();
    await expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  },
};
