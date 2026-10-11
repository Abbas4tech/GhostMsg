import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn } from "storybook/test";
import { SettingsPanel } from "./settings-panel";
import {
  closedWithBlocksSettingsPanelArgs,
  defaultSettingsPanelArgs,
} from "./settings-panel.mock";

const ACCEPT_REGEX = /accept messages/i;
const WEB_PUSH_REGEX = /web push notifications/i;
const DAILY_REGEX = /daily digest/i;
const UNBLOCK_ALL_REGEX = /unblock all senders/i;
const UNBLOCK_REGEX = /^unblock$/i;

const meta = {
  title: "Blocks/SettingsPanel",
  component: SettingsPanel,
  tags: ["autodocs"],
  args: {
    ...defaultSettingsPanelArgs,
    onToggleAcceptance: fn(),
    onEmailAlertChange: fn(),
    onToggleWebPush: fn(),
    onUnblock: fn(),
    onUnblockAll: fn(),
  },
  argTypes: {
    isAccepting: {
      control: "boolean",
      description: "Message acceptance switch",
    },
    emailAlerts: {
      control: "radio",
      options: ["instant", "daily", "off"],
      description: "Email alert frequency",
    },
    webPushEnabled: { control: "boolean", description: "Web push switch" },
    blockedHashes: {
      control: "object",
      description: "Blocked sender fingerprints",
    },
    isAcceptancePending: {
      control: "boolean",
      description: "Disables the acceptance switch",
    },
    isNotificationPending: {
      control: "boolean",
      description: "Disables email alert buttons",
    },
    isWebPushPending: {
      control: "boolean",
      description: "Disables the web push switch",
    },
    isUnblockPending: {
      control: "boolean",
      description: "Disables unblock buttons",
    },
    onToggleAcceptance: { description: "Acceptance switch toggled" },
    onEmailAlertChange: {
      description: "Email mode chosen → `instant` | `daily` | `off`",
    },
    onToggleWebPush: { description: "Web push toggled → boolean" },
    onUnblock: { description: "Unblock clicked → senderHash" },
    onUnblockAll: { description: "Unblock All Senders clicked" },
  },
} satisfies Meta<typeof SettingsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Defaults: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Message Acceptance")).toBeVisible();
    await expect(
      canvas.getByRole("switch", { name: ACCEPT_REGEX })
    ).toBeChecked();
    await expect(canvas.getByText("Blocked Senders (0)")).toBeVisible();
    await expect(
      canvas.getByText("No senders are currently blocked.")
    ).toBeVisible();
  },
};

export const EmitsChanges: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("switch", { name: ACCEPT_REGEX }));
    await expect(args.onToggleAcceptance).toHaveBeenCalledOnce();

    await userEvent.click(canvas.getByRole("switch", { name: WEB_PUSH_REGEX }));
    await expect(args.onToggleWebPush).toHaveBeenCalledWith(true);

    await userEvent.click(canvas.getByRole("button", { name: DAILY_REGEX }));
    await expect(args.onEmailAlertChange).toHaveBeenCalledWith("daily");
  },
};

export const ClosedWithBlockedSenders: Story = {
  args: closedWithBlocksSettingsPanelArgs,
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByText(
        "Your public profile is closed and not accepting messages"
      )
    ).toBeVisible();
    await expect(canvas.getByText("3 blocked senders")).toBeVisible();

    await userEvent.click(
      canvas.getAllByRole("button", { name: UNBLOCK_REGEX })[0]
    );
    await expect(args.onUnblock).toHaveBeenCalledWith(
      closedWithBlocksSettingsPanelArgs.blockedHashes[0]
    );

    await userEvent.click(
      canvas.getByRole("button", { name: UNBLOCK_ALL_REGEX })
    );
    await expect(args.onUnblockAll).toHaveBeenCalledOnce();
  },
};

export const AllPending: Story = {
  args: {
    ...closedWithBlocksSettingsPanelArgs,
    isAcceptancePending: true,
    isNotificationPending: true,
    isWebPushPending: true,
    isUnblockPending: true,
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("switch", { name: ACCEPT_REGEX })
    ).toBeDisabled();
    await expect(
      canvas.getByRole("button", { name: UNBLOCK_ALL_REGEX })
    ).toBeDisabled();
  },
};

export const EmailOff: Story = { args: { emailAlerts: "off" } };

export const Mobile: Story = {
  args: closedWithBlocksSettingsPanelArgs,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
