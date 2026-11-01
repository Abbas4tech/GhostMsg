import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Heart } from "lucide-react";
import { useCallback, useState } from "react";
import { expect } from "storybook/test";
import { Button } from "@/components/elements/button";
import { AutoHeight } from "./auto-height";
import { autoHeightMockParagraphs, highlightMockItems } from "./effects.mock";
import { GravityStarsBackground } from "./gravity-stars";
import { Highlight, HighlightItem } from "./highlight";
import { Particles, ParticlesEffect } from "./particles";
import { PresenceItem, PresenceList } from "./presence-list";

/** Motion primitives shared by elements (tabs, icon-button, …). Decorative only. */
const meta = {
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  title: "Elements/Effects",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const GravityStars: Story = {
  render: () => (
    <div className="relative h-64 w-[28rem] overflow-hidden rounded-xl border">
      <GravityStarsBackground />
    </div>
  ),
};

export const HoverHighlight: Story = {
  render: () => (
    <Highlight className="rounded-md bg-muted" hover>
      <div className="flex gap-1 p-1">
        {highlightMockItems.map((item) => (
          <HighlightItem key={item} value={item}>
            <div className="relative z-10 rounded-md px-4 py-2 text-sm">
              {item}
            </div>
          </HighlightItem>
        ))}
      </div>
    </Highlight>
  ),
};

function ParticlesDemo() {
  const [burst, setBurst] = useState(0);
  const handleBurst = useCallback(() => {
    setBurst((n) => n + 1);
  }, []);
  return (
    <Particles animate={burst > 0} asChild key={burst}>
      <Button
        aria-label="Like"
        onClick={handleBurst}
        size="icon"
        variant="outline"
      >
        <Heart />
        <ParticlesEffect className="size-1 rounded-full bg-sentiment-sweet" />
      </Button>
    </Particles>
  );
}

export const ParticleBurst: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Like" }));
    await expect(canvas.getByRole("button", { name: "Like" })).toBeVisible();
  },
  render: () => <ParticlesDemo />,
};

function AutoHeightDemo() {
  const [expanded, setExpanded] = useState(false);
  const handleToggleExpanded = useCallback(() => {
    setExpanded((v) => !v);
  }, []);
  return (
    <div className="flex w-72 flex-col gap-3">
      <Button onClick={handleToggleExpanded} variant="outline">
        {expanded ? "Collapse" : "Expand"}
      </Button>
      <AutoHeight className="rounded-md border p-3 text-sm">
        <p>
          {expanded ? autoHeightMockParagraphs[1] : autoHeightMockParagraphs[0]}
        </p>
      </AutoHeight>
    </div>
  );
}

export const AnimatedHeight: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Expand" }));
    await expect(
      await canvas.findByText(autoHeightMockParagraphs[1])
    ).toBeInTheDocument();
  },
  render: () => <AutoHeightDemo />,
};

const ITEM_REGEX = /^Item /;
const PRESENCE_KEYS = ["a", "b", "c", "d", "e"];

function PresenceDemo() {
  const [items, setItems] = useState(PRESENCE_KEYS);
  const handleRemove = useCallback(() => {
    setItems((current) => current.slice(1));
  }, []);
  return (
    <div className="flex w-80 flex-col gap-3">
      <Button onClick={handleRemove} size="sm" variant="outline">
        Remove first
      </Button>
      <div className="relative flex flex-col gap-2">
        <PresenceList>
          {items.map((key, index) => (
            <PresenceItem index={index} key={key}>
              <div className="rounded-md border bg-card p-3 text-sm">
                Item {key}
              </div>
            </PresenceItem>
          ))}
        </PresenceList>
      </div>
    </div>
  );
}

/** Motion: items rise in with a capped stagger; removing one fades it out and the rest slide up. */
export const PresenceListRemoval: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getAllByText(ITEM_REGEX)).toHaveLength(5);
    await userEvent.click(canvas.getByRole("button", { name: "Remove first" }));
    await expect(canvas.queryByText("Item a")).toBeNull();
    await expect(canvas.getAllByText(ITEM_REGEX)).toHaveLength(4);
  },
  render: () => <PresenceDemo />,
};
