import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { FIXTURE_AMA_PROMPT } from "@/mock/fixtures/public-profile.fixtures";
import { ProfilePanel, type ProfilePanelProps } from "./profile-panel";
import {
  defaultProfilePanelArgs,
  dirtyProfilePanelArgs,
} from "./profile-panel.mock";

const withSpies = (args: ProfilePanelProps): ProfilePanelProps => ({
  ...args,
  ama: { ...args.ama, onChange: fn(), onSuggest: fn() },
  identity: {
    ...args.identity,
    onChangeUsername: fn(),
    onDisplayNameChange: fn(),
  },
  link: { ...args.link, onCopy: fn(), onShare: fn() },
  unsaved: { ...args.unsaved, onDiscard: fn(), onSave: fn() },
});

const meta = {
  args: withSpies(defaultProfilePanelArgs),
  argTypes: {
    ama: { control: "object", description: "AMA Prompt editor props" },
    identity: { control: "object", description: "Identity card props" },
    isAccepting: {
      control: "boolean",
      description: "Message Acceptance shown in the preview",
    },
    link: { control: "object", description: "Share link card props" },
    unsaved: { control: "object", description: "Unsaved changes bar props" },
  },
  component: ProfilePanel,
  tags: ["autodocs"],
  title: "Blocks/ProfilePanel",
} satisfies Meta<typeof ProfilePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Profile" })
    ).toBeVisible();
    await expect(canvas.getByLabelText("Your profile link")).toHaveValue(
      "ghostmsg.app/u/johndoe"
    );
    await expect(
      canvas.getByLabelText("What do you want people to ask?")
    ).toHaveValue(FIXTURE_AMA_PROMPT);
    await expect(
      canvas.getByRole("complementary", { name: "Preview" })
    ).toHaveTextContent(FIXTURE_AMA_PROMPT);
    await userEvent.click(canvas.getByRole("button", { name: "Copy" }));
    await expect(args.link.onCopy).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Change" }));
    await expect(args.identity.onChangeUsername).toHaveBeenCalledOnce();
    await expect(
      canvas.queryByRole("region", { name: "Unsaved changes" })
    ).not.toBeInTheDocument();
  },
};

export const UnsavedChanges: Story = {
  args: {
    unsaved: {
      ...dirtyProfilePanelArgs.unsaved,
      onDiscard: fn(),
      onSave: fn(),
    },
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(args.unsaved.onSave).toHaveBeenCalledOnce();
  },
};

export const BannerHidden: Story = {
  args: { ama: { ...defaultProfilePanelArgs.ama, showBanner: false } },
};

export const Paused: Story = { args: { isAccepting: false } };

export const Mobile: Story = {
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
