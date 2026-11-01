import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Heart } from "lucide-react";
import { useCallback, useState } from "react";
import { expect } from "storybook/test";
import { AutoHeight } from "@/components/animate/auto-height";
import { Burst } from "@/components/animate/burst";
import { GravityStarsBackground } from "@/components/animate/gravity-stars";
import { Highlight, HighlightItem } from "@/components/animate/highlight";
import { LayoutIndicator } from "@/components/animate/layout-indicator";
import { NumberTicker } from "@/components/animate/number-ticker";
import { Particles, ParticlesEffect } from "@/components/animate/particles";
import { Presence, PresenceItem } from "@/components/animate/presence";
import { Reveal, RevealItem } from "@/components/animate/reveal";
import { Button } from "@/components/elements/button";
import { autoHeightMockParagraphs, highlightMockItems } from "./showcase.mock";

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
        <Presence>
          {items.map((key, index) => (
            <PresenceItem index={index} key={key}>
              <div className="rounded-md border bg-card p-3 text-sm">
                Item {key}
              </div>
            </PresenceItem>
          ))}
        </Presence>
      </div>
    </div>
  );
}

/** Motion: items rise in with a capped stagger; removing one fades it out and the rest slide up. */
export const PresenceRemoval: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getAllByText(ITEM_REGEX)).toHaveLength(5);
    await userEvent.click(canvas.getByRole("button", { name: "Remove first" }));
    await expect(canvas.queryByText("Item a")).toBeNull();
    await expect(canvas.getAllByText(ITEM_REGEX)).toHaveLength(4);
  },
  render: () => <PresenceDemo />,
};

const COUNTS = [3, 12, 7, 128, 0];

function AnimatedCountDemo() {
  const [index, setIndex] = useState(0);
  const handleNext = useCallback(() => {
    setIndex((current) => (current + 1) % COUNTS.length);
  }, []);
  return (
    <div className="flex items-center gap-4">
      <span className="text-display">
        <NumberTicker value={COUNTS[index] ?? 0} />
      </span>
      <Button onClick={handleNext} size="sm" variant="outline">
        Next count
      </Button>
    </div>
  );
}

/** Motion: counts roll to their new value on a spring. Screen readers get the settled number. */
export const AnimatedCount: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(
      canvas.getByText("3", { selector: ".sr-only" })
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "Next count" }));
    await expect(
      canvas.getByText("12", { selector: ".sr-only" })
    ).toBeInTheDocument();
  },
  render: () => <AnimatedCountDemo />,
};

function SuccessBurstDemo() {
  const [run, setRun] = useState(0);
  const handleReplay = useCallback(() => {
    setRun((current) => current + 1);
  }, []);
  return (
    <div className="flex flex-col items-center gap-6">
      <span className="relative grid size-24 place-items-center">
        <span className="grid size-16 place-items-center rounded-full bg-success text-success-foreground">
          <Heart aria-hidden="true" />
        </span>
        <Burst dotClassName="size-2 bg-success" key={run} radius={64} />
      </span>
      <Button onClick={handleReplay} size="sm" variant="outline">
        Replay burst
      </Button>
    </div>
  );
}

/** Motion: one-shot radial burst for a Delight moment. Rich motion only (off on reduced motion, Save-Data, low-end). */
export const SuccessBurst: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Replay burst" })
    ).toBeVisible();
  },
  render: () => <SuccessBurstDemo />,
};

const INDICATOR_ITEMS = ["Inbox", "Profile", "Settings"];

function SlidingIndicatorDemo() {
  const [active, setActive] = useState(0);
  const handleNext = useCallback(() => {
    setActive((current) => (current + 1) % INDICATOR_ITEMS.length);
  }, []);
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex gap-1 rounded-full border bg-card p-1">
        {INDICATOR_ITEMS.map((item, index) => (
          <span
            className="relative isolate rounded-full px-4 py-2 font-semibold text-sm data-[active=true]:text-primary-foreground"
            data-active={index === active}
            key={item}
          >
            {index === active ? (
              <LayoutIndicator
                className="rounded-full bg-primary"
                layoutId="story-sliding-indicator"
              />
            ) : null}
            {item}
          </span>
        ))}
      </div>
      <Button onClick={handleNext} size="sm" variant="outline">
        Next item
      </Button>
    </div>
  );
}

/** Motion: the active pill glides between items on the soft spring (shared layoutId). */
export const SlidingIndicator: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Next item" }));
    await expect(canvas.getByText("Profile")).toHaveAttribute(
      "data-active",
      "true"
    );
  },
  render: () => <SlidingIndicatorDemo />,
};

const REVEAL_CARDS = ["One link", "Anonymous Messages", "Story Cards"];

/** Motion: scroll down; the cards rise in one after another the first time they enter view. */
export const ScrollReveal: Story = {
  parameters: { layout: "fullscreen" },
  play: async ({ canvas }) => {
    // Server-visible by design: content is in the DOM and not hidden before scroll.
    await expect(canvas.getByText("Story Cards")).toBeInTheDocument();
  },
  render: () => (
    <div className="px-6">
      <p className="flex h-[900px] items-start pt-6 text-muted-foreground">
        Scroll down ↓
      </p>
      <Reveal className="grid grid-cols-3 gap-3 pb-24">
        {REVEAL_CARDS.map((card) => (
          <RevealItem
            className="rounded-xl border bg-card p-6 font-semibold"
            key={card}
          >
            {card}
          </RevealItem>
        ))}
      </Reveal>
    </div>
  ),
};
