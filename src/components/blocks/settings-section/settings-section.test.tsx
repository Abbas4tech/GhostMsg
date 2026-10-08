import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SettingsSection } from "./settings-section";

const TITLE_REGEX = /accept messages/i;
const DESC_REGEX = /toggle anonymous message reception/i;
const TOGGLE_REGEX = /toggle/i;

describe("Block: SettingsSection", () => {
  it("should render title, description, and control slot", () => {
    render(
      <SettingsSection
        controlSlot={<button type="button">Toggle</button>}
        description="Toggle anonymous message reception"
        title="Accept Messages"
      />
    );

    expect(screen.getByText(TITLE_REGEX)).toBeInTheDocument();
    expect(screen.getByText(DESC_REGEX)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: TOGGLE_REGEX })
    ).toBeInTheDocument();
  });
});
