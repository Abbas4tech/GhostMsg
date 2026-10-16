import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { IdentityCard } from "./identity-card";
import {
  defaultIdentityCardArgs,
  withPhotoIdentityCardArgs,
} from "./identity-card.mock";

const CHANGE_PHOTO_REGEX = /change photo/i;

const meta = {
  title: "Patterns/IdentityCard",
  component: IdentityCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  args: {
    ...defaultIdentityCardArgs,
    onChangeUsername: fn(),
    onDisplayNameChange: fn(),
    onPhotoRemove: fn(),
    onPhotoSelect: fn(),
  },
  argTypes: {
    username: { control: "text", description: "Current username" },
    displayName: { control: "text", description: "Controlled display name" },
    avatarUrl: { control: "text", description: "Photo (data URL) or null" },
    linkPrefix: { control: "text", description: "Shown before the username" },
    isPhotoProcessing: {
      control: "boolean",
      description: "Resizing the chosen photo",
    },
    onDisplayNameChange: { description: "Display name typed → value" },
    onPhotoSelect: { description: "File chosen → File" },
    onPhotoRemove: { description: "Remove photo clicked" },
    onChangeUsername: { description: "Change clicked (opens the dialog)" },
  },
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
