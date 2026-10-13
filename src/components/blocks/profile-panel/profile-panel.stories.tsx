import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { ProfilePanel } from "./profile-panel";
import { defaultProfilePanelArgs } from "./profile-panel.mock";

const SAVE_REGEX = /save topic banner/i;
const SAVING_REGEX = /saving/i;

const meta = {
  title: "Blocks/ProfilePanel",
  component: ProfilePanel,
  tags: ["autodocs"],
  args: {
    ...defaultProfilePanelArgs,
    onAmaPromptChange: fn(),
    onCopyProfileUrl: fn(),
    onSaveAmaPrompt: fn(),
  },
  argTypes: {
    profileUrl: { control: "text", description: "Shareable public URL" },
    amaPrompt: { control: "text", description: "Controlled AMA prompt" },
    isSavingAmaPrompt: {
      control: "boolean",
      description: "Saving state of the editor",
    },
    onCopyProfileUrl: { description: "Copy clicked" },
    onAmaPromptChange: { description: "Prompt edited → text" },
    onSaveAmaPrompt: { description: "Save Topic Banner clicked" },
  },
} satisfies Meta<typeof ProfilePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByLabelText("Your profile link")).toHaveValue(
      defaultProfilePanelArgs.profileUrl
    );
    await expect(canvas.getByLabelText("AMA prompt")).toHaveValue(
      defaultProfilePanelArgs.amaPrompt
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Copy to clipboard" })
    );
    await expect(args.onCopyProfileUrl).toHaveBeenCalledOnce();

    await userEvent.click(canvas.getByRole("button", { name: SAVE_REGEX }));
    await expect(args.onSaveAmaPrompt).toHaveBeenCalledOnce();
  },
};

export const Saving: Story = {
  args: { isSavingAmaPrompt: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: SAVING_REGEX })
    ).toBeDisabled();
  },
};

export const BlankPrompt: Story = { args: { amaPrompt: "" } };

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
