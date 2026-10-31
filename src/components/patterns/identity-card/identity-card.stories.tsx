import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { IdentityCard, IdentitySummary } from "./identity-card";
import {
  defaultIdentityCardArgs,
  defaultIdentitySummaryArgs,
  withPhotoIdentityCardArgs,
} from "./identity-card.mock";

const CHANGE_PHOTO_REGEX = /change photo/i;
const onEditSummary = fn();

const meta = {
  args: {
    ...defaultIdentityCardArgs,
    onChangeUsername: fn(),
    onDisplayNameChange: fn(),
    onPhotoRemove: fn(),
    onPhotoSelect: fn(),
  },
  argTypes: {
    avatarUrl: { control: "text", description: "Photo (data URL) or null" },
    displayName: { control: "text", description: "Controlled display name" },
    isPhotoProcessing: {
      control: "boolean",
      description: "Resizing the chosen photo",
    },
    linkPrefix: { control: "text", description: "Shown before the username" },
    onChangeUsername: { description: "Change clicked (opens the dialog)" },
    onDisplayNameChange: { description: "Display name typed → value" },
    onPhotoRemove: { description: "Remove photo clicked" },
    onPhotoSelect: { description: "File chosen → File" },
    username: { control: "text", description: "Current username" },
  },
  component: IdentityCard,
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  title: "Patterns/IdentityCard",
} satisfies Meta<typeof IdentityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByLabelText("Username")).toHaveValue("johndoe");
    await expect(
      canvas.queryByRole("button", { name: "Remove" })
    ).not.toBeInTheDocument();

    await userEvent.type(canvas.getByLabelText("Display name"), "!");
    await expect(args.onDisplayNameChange).toHaveBeenCalledWith("John!");

    await userEvent.click(canvas.getByRole("button", { name: "Change" }));
    await expect(args.onChangeUsername).toHaveBeenCalledOnce();
  },
};

export const SelectsPhoto: Story = {
  play: async ({ args, canvas, userEvent }) => {
    const file = new File(["photo"], "me.png", { type: "image/png" });
    await userEvent.upload(
      canvas.getByLabelText("Upload a profile photo"),
      file
    );
    await expect(args.onPhotoSelect).toHaveBeenCalledWith(file);
  },
};

export const WithPhoto: Story = {
  args: withPhotoIdentityCardArgs,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Remove" }));
    await expect(args.onPhotoRemove).toHaveBeenCalledOnce();
  },
};

export const ProcessingPhoto: Story = {
  args: { isPhotoProcessing: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: CHANGE_PHOTO_REGEX })
    ).toBeDisabled();
  },
};

/** Design MobProfile: phones show this row; Edit unfolds the full card. */
export const Summary: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
  play: async ({ canvas, userEvent }) => {
    await expect(
      canvas.getByRole("region", { name: "Identity" })
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Edit" }));
    await expect(onEditSummary).toHaveBeenCalledOnce();
  },
  render: () => (
    <IdentitySummary {...defaultIdentitySummaryArgs} onEdit={onEditSummary} />
  ),
};
