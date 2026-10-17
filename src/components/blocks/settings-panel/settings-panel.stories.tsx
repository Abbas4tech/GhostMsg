import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { SettingsPanel, type SettingsPanelProps } from "./settings-panel";
import {
  closedWithBlocksSettingsPanelArgs,
  defaultSettingsPanelArgs,
} from "./settings-panel.mock";

const ACCEPT_REGEX = /^message acceptance$/i;
const WEB_PUSH_REGEX = /^push notifications$/i;
const DARK_REGEX = /^dark/i;
const UNBLOCK_REGEX = /^unblock sender #/i;

const withSpies = (args: SettingsPanelProps): SettingsPanelProps => ({
  appearance: {
    ...args.appearance,
    onModeChange: fn(),
    onPaletteChange: fn(),
  },
  danger: { onDeleteAccount: fn(), onDeleteAll: fn() },
  data: { onExport: fn() },
  messages: {
    ...args.messages,
    onOfferSuggestionsChange: fn(),
    onPublishByDefaultChange: fn(),
    onToggleAcceptance: fn(),
  },
  notifications: {
    ...args.notifications,
    onEmailAlertChange: fn(),
    onHideMessageTextChange: fn(),
    onQuietHoursChange: fn(),
    onToggleWebPush: fn(),
  },
  safety: {
    ...args.safety,
    onBlurSpicyChange: fn(),
    onQuarantineChange: fn(),
    onSensitivityChange: fn(),
    onUnblock: fn(),
  },
});

const meta = {
  args: withSpies(defaultSettingsPanelArgs),
  argTypes: {
    appearance: { control: "object", description: "Mode + palette" },
    danger: { control: "object", description: "Delete all / account" },
    data: { control: "object", description: "Export" },
    messages: { control: "object", description: "Messages section" },
    notifications: {
      control: "object",
      description: "Notifications section",
    },
    safety: { control: "object", description: "Safety & blocking section" },
  },
  component: SettingsPanel,
  tags: ["autodocs"],
  title: "Blocks/SettingsPanel",
} satisfies Meta<typeof SettingsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Defaults: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Settings" })
    ).toBeVisible();
    await expect(
      canvas.getByRole("switch", { name: ACCEPT_REGEX })
    ).toBeChecked();
    await expect(canvas.getByText("0 Sender Hashes")).toBeVisible();
    await expect(canvas.getByText("No one is blocked")).toBeVisible();
  },
};

export const EmitsChanges: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("switch", { name: ACCEPT_REGEX }));
    await expect(args.messages.onToggleAcceptance).toHaveBeenCalledOnce();

    await userEvent.click(canvas.getByRole("switch", { name: WEB_PUSH_REGEX }));
    await expect(args.notifications.onToggleWebPush).toHaveBeenCalledWith(true);

    await userEvent.click(canvas.getByRole("radio", { name: "Strict" }));
    await expect(args.safety.onSensitivityChange).toHaveBeenCalledWith(
      "strict"
    );

    await userEvent.click(canvas.getByRole("radio", { name: DARK_REGEX }));
    await expect(args.appearance.onModeChange).toHaveBeenCalledWith("dark");

    await userEvent.click(canvas.getByRole("button", { name: "JSON" }));
    await expect(args.data.onExport).toHaveBeenCalledWith("json");

    await userEvent.click(canvas.getByRole("button", { name: "Delete all" }));
    await expect(args.danger.onDeleteAll).toHaveBeenCalledOnce();
  },
};

export const ClosedWithBlockedSenders: Story = {
  args: withSpies(closedWithBlocksSettingsPanelArgs),
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByRole("switch", { name: ACCEPT_REGEX })
    ).not.toBeChecked();
    await expect(canvas.getByText("3 Sender Hashes")).toBeVisible();

    await userEvent.click(
      canvas.getAllByRole("button", { name: UNBLOCK_REGEX })[0]
    );
    await expect(args.safety.onUnblock).toHaveBeenCalledWith(
      closedWithBlocksSettingsPanelArgs.safety.blockedSenders[0]?.hash
    );
  },
};

export const AllPending: Story = {
  args: {
    ...withSpies(closedWithBlocksSettingsPanelArgs),
    messages: {
      ...closedWithBlocksSettingsPanelArgs.messages,
      isAcceptancePending: true,
    },
    safety: {
      ...closedWithBlocksSettingsPanelArgs.safety,
      isUnblockPending: true,
    },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("switch", { name: ACCEPT_REGEX })
    ).toBeDisabled();
    await Promise.all(
      canvas
        .getAllByRole("button", { name: UNBLOCK_REGEX })
        .map((button) => expect(button).toBeDisabled())
    );
  },
};

export const QuarantineOff: Story = {
  args: {
    safety: { ...defaultSettingsPanelArgs.safety, quarantineEnabled: false },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("radio", { name: "Strict" })).toBeDisabled();
  },
};

export const Mobile: Story = {
  args: withSpies(closedWithBlocksSettingsPanelArgs),
  globals: { viewport: { isRotated: false, value: "mobile1" } },
};
