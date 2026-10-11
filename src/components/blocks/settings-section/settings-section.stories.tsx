import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ShieldCheck } from "lucide-react";
import { expect, fn } from "storybook/test";
import { Button } from "@/components/elements/button";
import { Switch } from "@/components/elements/switch";
import { SettingsSection } from "./settings-section";
import {
  cardSettingsSectionArgs,
  defaultSettingsSectionArgs,
  SETTINGS_SECTION_SIZES,
  SETTINGS_SECTION_VARIANTS,
} from "./settings-section.mock";

const onCheckedChange = fn();

const meta = {
  title: "Blocks/SettingsSection",
  component: SettingsSection,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
  args: {
    ...defaultSettingsSectionArgs,
    controlSlot: (
      <Switch id="accept-messages" onCheckedChange={onCheckedChange} />
    ),
  },
  argTypes: {
    variant: {
      control: "select",
      options: SETTINGS_SECTION_VARIANTS,
      description:
        "`row` = bordered row inside a settings Card; `card` = standalone",
    },
    size: {
      control: "radio",
      options: SETTINGS_SECTION_SIZES,
      description: "Padding preset",
    },
    title: {
      control: "text",
      description: "Title (rendered as `<label>` when `controlId` is set)",
    },
    description: { control: "text", description: "Helper text" },
    controlId: {
      control: "text",
      description: "id of the control in `controlSlot`",
    },
    icon: { control: false, description: "Leading icon" },
    controlSlot: { control: false, description: "Switch / select / button" },
    actionButtonSlot: { control: false, description: "Secondary action" },
  },
} satisfies Meta<typeof SettingsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Row: Story = {
  play: async ({ canvas, userEvent }) => {
    // The title is a real <label> for the switch.
    await userEvent.click(canvas.getByText("Accept Messages"));
    await expect(onCheckedChange).toHaveBeenCalledWith(true);
    await expect(
      canvas.getByRole("switch", { name: "Accept Messages" })
    ).toBeChecked();
  },
};

export const Card: Story = {
  args: {
    ...cardSettingsSectionArgs,
    icon: <ShieldCheck className="h-5 w-5 text-purple-500" />,
    controlId: undefined,
    controlSlot: <Switch aria-label="Message acceptance" />,
  },
};

export const WithAction: Story = {
  args: {
    ...cardSettingsSectionArgs,
    controlId: undefined,
    controlSlot: undefined,
    actionButtonSlot: (
      <Button size="sm" variant="outline">
        Manage
      </Button>
    ),
  },
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div className="space-y-4">
      {SETTINGS_SECTION_VARIANTS.map((variant) => (
        <SettingsSection
          {...args}
          controlId={undefined}
          controlSlot={<Switch aria-label={`${variant} toggle`} />}
          key={variant}
          title={`${variant} variant`}
          variant={variant}
        />
      ))}
    </div>
  ),
};

export const LongText: Story = {
  args: {
    title: "Browser push notifications for every new anonymous message",
    description:
      "Receive instant device notifications when visitors send messages, even if your tab is closed, on every device where you enable it.",
  },
};

export const Mobile: Story = {
  args: {
    ...cardSettingsSectionArgs,
    controlId: undefined,
    controlSlot: <Switch aria-label="Toggle" />,
  },
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
