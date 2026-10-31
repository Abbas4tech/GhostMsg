import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChevronLeft, ListChecks, Search } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { expect, fn } from "storybook/test";
import { BrandMark } from "@/components/patterns/brand-mark";
import {
  MobileHeaderAction,
  MobileHeaderActions,
  MobileHeaderLeading,
  MobileHeaderSlotProvider,
} from "./mobile-header-actions";
import { mobileHeaderActionsMock } from "./mobile-header-actions.mock";

interface HarnessProps {
  onSearch: () => void;
  onSelect: () => void;
  /** Fill the leading slot (e.g. "Back to inbox"); hides the brand tile. */
  withLeading: boolean;
}

const noopUnregister = () => undefined;

/** A stand-in for the dashboard shell's phone top bar and its two slots. */
function TopBarHarness({
  onSearch,
  onSelect,
  withLeading,
}: HarnessProps): React.JSX.Element {
  const [actions, setActions] = useState<HTMLElement | null>(null);
  const [leading, setLeading] = useState<HTMLElement | null>(null);
  const slots = useMemo(
    () => ({ actions, leading, registerLeading: () => noopUnregister }),
    [actions, leading]
  );
  return (
    <MobileHeaderSlotProvider slots={slots}>
      <header className="flex min-h-14 items-center gap-2 border-b px-3">
        <div className="flex items-center" ref={setLeading}>
          {withLeading ? null : <BrandMark href="/" size="sm" />}
        </div>
        <div className="ml-auto flex items-center gap-1" ref={setActions} />
      </header>
      {withLeading ? (
        <MobileHeaderLeading>
          <MobileHeaderAction label="Back to inbox" onClick={onSelect}>
            <ChevronLeft />
          </MobileHeaderAction>
        </MobileHeaderLeading>
      ) : null}
      <MobileHeaderActions>
        <MobileHeaderAction
          label={mobileHeaderActionsMock.searchLabel}
          onClick={onSearch}
        >
          <Search />
        </MobileHeaderAction>
        <MobileHeaderAction
          label={mobileHeaderActionsMock.selectLabel}
          onClick={onSelect}
        >
          <ListChecks />
        </MobileHeaderAction>
      </MobileHeaderActions>
    </MobileHeaderSlotProvider>
  );
}

const meta = {
  args: { onSearch: fn(), onSelect: fn(), withLeading: false },
  argTypes: {
    onSearch: { description: "Search clicked" },
    onSelect: { description: "Select (or Back) clicked" },
    withLeading: {
      control: "boolean",
      description: "Fill the leading slot (brand tile hides)",
    },
  },
  component: TopBarHarness,
  globals: { viewport: { isRotated: false, value: "mobile1" } },
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  title: "Patterns/MobileHeaderActions",
} satisfies Meta<typeof TopBarHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Design MobInbox: Search and Select right of the brand tile, 44px each. */
export const InboxActions: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(
      await canvas.findByRole("button", {
        name: mobileHeaderActionsMock.searchLabel,
      })
    );
    await expect(args.onSearch).toHaveBeenCalledOnce();
  },
};

/** Design MobQuarantine: "Back to inbox" replaces the brand tile. */
export const WithLeading: Story = {
  args: { withLeading: true },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole("button", { name: "Back to inbox" })
    ).toBeVisible();
  },
};
