import { HttpResponse, http } from "msw";
import { userSettingsScenarios } from "@/mock/fixtures/user.fixtures";
import { mswPath, ok } from "./utils";

type SettingsScenario = (typeof userSettingsScenarios)["defaults"];

/** Settings tab + profile tab endpoints for a given account state. */
export const settingsHandlers = (scenario: SettingsScenario) => [
  http.get(mswPath("/api/accept-message"), () =>
    ok("/api/accept-message", "get", {
      success: true,
      isAcceptingMessage: scenario.isAcceptingMessage,
      message: "Status fetched",
    })
  ),
  http.post(mswPath("/api/accept-message"), () =>
    HttpResponse.json({ success: true, message: "Acceptance updated" })
  ),
  http.get(mswPath("/api/user/notifications"), () =>
    ok("/api/user/notifications", "get", {
      success: true,
      notificationSettings: scenario.notificationSettings,
      isAcceptingMessage: scenario.isAcceptingMessage,
    })
  ),
  http.patch(mswPath("/api/user/notifications"), () =>
    HttpResponse.json({
      success: true,
      message: "Notification settings updated",
    })
  ),
  http.get(mswPath("/api/block-sender"), () =>
    ok("/api/block-sender", "get", {
      success: true,
      blockedSenderHashes: scenario.blockedSenderHashes,
    })
  ),
  http.post(mswPath("/api/block-sender"), () =>
    HttpResponse.json({ success: true, message: "Sender blocked" })
  ),
  http.delete(mswPath("/api/block-sender"), () =>
    HttpResponse.json({ success: true, message: "Sender unblocked" })
  ),
  http.patch(mswPath("/api/user/ama-prompt"), async ({ request }) => {
    const body = (await request.json()) as { amaPrompt?: string };
    return ok("/api/user/ama-prompt", "patch", {
      success: true,
      amaPrompt: body.amaPrompt ?? "",
      message: "AMA prompt updated",
    });
  }),
  http.post(mswPath("/api/user/push-subscription"), () =>
    HttpResponse.json({ success: true, message: "Subscribed" })
  ),
  http.delete(mswPath("/api/user/push-subscription"), () =>
    HttpResponse.json({ success: true, message: "Push subscription removed" })
  ),
];

export const userHandlers = {
  settings: {
    defaults: settingsHandlers(userSettingsScenarios.defaults),
    closedWithBlocks: settingsHandlers(userSettingsScenarios.closedWithBlocks),
  },
};
