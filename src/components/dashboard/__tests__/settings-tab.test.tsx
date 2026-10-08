import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/test-utils";
import { SettingsTab } from "../settings-tab";

const BLOCKED_SENDERS_REGEX = /Blocked Senders/i;
const ACCEPT_MESSAGES_REGEX = /accept messages/i;

describe("SettingsTab component", () => {
  it("should render message acceptance, email alert options, web push toggle, and blocked senders card", () => {
    renderWithProviders(<SettingsTab />);

    expect(screen.getByText("Message Acceptance")).toBeInTheDocument();
    expect(screen.getByText("Email Alert Notifications")).toBeInTheDocument();
    expect(screen.getByText("⚡ Instant Alerts")).toBeInTheDocument();
    expect(screen.getByText("📅 Daily Digest")).toBeInTheDocument();
    expect(screen.getByText("🔕 Off")).toBeInTheDocument();
    expect(
      screen.getByText("Browser Push Notifications (PWA)")
    ).toBeInTheDocument();
    expect(screen.getByText(BLOCKED_SENDERS_REGEX)).toBeInTheDocument();
  });

  it("should trigger controlled onToggle callback when acceptance switch is clicked", async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    renderWithProviders(
      <SettingsTab acceptMessages={true} onToggle={handleToggle} />
    );

    const switchEl = screen.getByRole("switch", {
      name: ACCEPT_MESSAGES_REGEX,
    });
    await user.click(switchEl);

    expect(handleToggle).toHaveBeenCalled();
  });
});
