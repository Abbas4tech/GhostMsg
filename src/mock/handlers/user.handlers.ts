import { HttpResponse, http } from "msw";
import { userSettingsScenarios } from "@/mock/fixtures/user.fixtures";
import { apiError, mswPath, ok } from "./utils";

type SettingsScenario = (typeof userSettingsScenarios)["defaults"];

/** Profile + Settings endpoints for a given account state. */
export const settingsHandlers = (scenario: SettingsScenario) => [
  http.get(mswPath("/api/accept-message"), () =>
    ok("/api/accept-message", "get", {
      isAcceptingMessage: scenario.isAcceptingMessage,
      message: "Status fetched",
      success: true,
    })
  ),
  http.post(mswPath("/api/accept-message"), () =>
    HttpResponse.json({ message: "Acceptance updated", success: true })
  ),
  http.get(mswPath("/api/user/notifications"), () =>
    ok("/api/user/notifications", "get", {
      isAcceptingMessage: scenario.isAcceptingMessage,
      notificationSettings: scenario.notificationSettings,
      success: true,
    })
  ),
  http.patch(mswPath("/api/user/notifications"), () =>
    HttpResponse.json({
      message: "Notification settings updated",
      success: true,
    })
  ),
  http.get(mswPath("/api/block-sender"), () =>
    ok("/api/block-sender", "get", {
      blockedSenderHashes: scenario.blockedSenderHashes,
      blockedSenders: scenario.blockedSenders,
      success: true,
    })
  ),
  http.post(mswPath("/api/block-sender"), () =>
    HttpResponse.json({ message: "Sender blocked", success: true })
  ),
  http.delete(mswPath("/api/block-sender"), () =>
    HttpResponse.json({ message: "Sender unblocked", success: true })
  ),
  http.patch(mswPath("/api/user/ama-prompt"), async ({ request }) => {
    const body = (await request.json()) as { amaPrompt?: string };
    return ok("/api/user/ama-prompt", "patch", {
      amaPrompt: body.amaPrompt ?? "",
      message: "AMA prompt updated",
      success: true,
    });
  }),
  http.post(mswPath("/api/user/push-subscription"), () =>
    HttpResponse.json({ message: "Subscribed", success: true })
  ),
  http.delete(mswPath("/api/user/push-subscription"), () =>
    HttpResponse.json({ message: "Push subscription removed", success: true })
  ),
  http.get(mswPath("/api/user/profile"), () =>
    ok("/api/user/profile", "get", {
      profile: scenario.profile,
      success: true,
    })
  ),
  http.patch(mswPath("/api/user/profile"), async ({ request }) => {
    const body = (await request.json()) as Partial<SettingsScenario["profile"]>;
    return ok("/api/user/profile", "patch", {
      message: "Profile updated",
      profile: { ...scenario.profile, ...body },
      success: true,
    });
  }),
  http.patch(mswPath("/api/user/username"), async ({ request }) => {
    const { username } = (await request.json()) as { username: string };
    return ok("/api/user/username", "patch", {
      message: "Username updated",
      success: true,
      username,
    });
  }),
  http.get(mswPath("/api/user/preferences"), () =>
    ok("/api/user/preferences", "get", {
      preferences: scenario.preferences,
      success: true,
    })
  ),
  http.patch(mswPath("/api/user/preferences"), async ({ request }) => {
    const body = (await request.json()) as {
      messages?: Partial<SettingsScenario["preferences"]["messages"]>;
      safety?: Partial<SettingsScenario["preferences"]["safety"]>;
    };
    return ok("/api/user/preferences", "patch", {
      message: "Preferences updated",
      preferences: {
        messages: { ...scenario.preferences.messages, ...body.messages },
        safety: { ...scenario.preferences.safety, ...body.safety },
      },
      success: true,
    });
  }),
  http.delete(mswPath("/api/messages"), () =>
    ok("/api/messages", "delete", {
      deletedCount: 6,
      message: "All messages deleted",
      success: true,
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
      message: "Account deleted",
      success: true,
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
    closedWithBlocks: settingsHandlers(userSettingsScenarios.closedWithBlocks),
    defaults: settingsHandlers(userSettingsScenarios.defaults),
    usernameTaken: [
      http.patch(mswPath("/api/user/username"), () =>
        apiError(409, "Username is already taken")
      ),
    ],
  },
};
