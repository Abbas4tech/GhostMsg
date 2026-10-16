import { HttpResponse, http } from "msw";
import { userSettingsScenarios } from "@/mock/fixtures/user.fixtures";
import { apiError, mswPath, ok } from "./utils";

type SettingsScenario = (typeof userSettingsScenarios)["defaults"];

/** Profile + Settings endpoints for a given account state. */
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
      blockedSenders: scenario.blockedSenders,
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
  http.get(mswPath("/api/user/profile"), () =>
    ok("/api/user/profile", "get", {
      success: true,
      profile: scenario.profile,
    })
  ),
  http.patch(mswPath("/api/user/profile"), async ({ request }) => {
    const body = (await request.json()) as Partial<SettingsScenario["profile"]>;
    return ok("/api/user/profile", "patch", {
      success: true,
      message: "Profile updated",
      profile: { ...scenario.profile, ...body },
    });
  }),
  http.patch(mswPath("/api/user/username"), async ({ request }) => {
    const { username } = (await request.json()) as { username: string };
    return ok("/api/user/username", "patch", {
      success: true,
      message: "Username updated",
      username,
    });
  }),
  http.get(mswPath("/api/user/preferences"), () =>
    ok("/api/user/preferences", "get", {
      success: true,
      preferences: scenario.preferences,
    })
  ),
  http.patch(mswPath("/api/user/preferences"), async ({ request }) => {
    const body = (await request.json()) as {
      messages?: Partial<SettingsScenario["preferences"]["messages"]>;
      safety?: Partial<SettingsScenario["preferences"]["safety"]>;
    };
    return ok("/api/user/preferences", "patch", {
      success: true,
      message: "Preferences updated",
      preferences: {
        messages: { ...scenario.preferences.messages, ...body.messages },
        safety: { ...scenario.preferences.safety, ...body.safety },
      },
    });
  }),
  http.delete(mswPath("/api/messages"), () =>
    ok("/api/messages", "delete", {
      success: true,
      message: "All messages deleted",
      deletedCount: 6,
    })
  ),
  http.delete(mswPath("/api/user"), async ({ request }) => {
    const { confirmUsername } = (await request.json()) as {
      confirmUsername?: string;
    };
    if (confirmUsername !== scenario.profile.username) {
      return apiError(400, "Type your username exactly to confirm");
    }
    return ok("/api/user", "delete", {
      success: true,
      message: "Account deleted",
    });
  }),
  http.post(mswPath("/api/ai/ama-suggestions"), () =>
    ok("/api/ai/ama-suggestions", "post", {
      success: true,
      suggestions: [
        "Ask me anything about switching careers",
        "Roast my music taste",
        "What should I read next?",
      ],
    })
  ),
];

export const userHandlers = {
  settings: {
    defaults: settingsHandlers(userSettingsScenarios.defaults),
    closedWithBlocks: settingsHandlers(userSettingsScenarios.closedWithBlocks),
    usernameTaken: [
      http.patch(mswPath("/api/user/username"), () =>
        apiError(409, "Username is already taken")
      ),
    ],
  },
};
