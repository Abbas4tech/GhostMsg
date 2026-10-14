export const queryKeys = {
  messages: {
    all: ["messages"] as const,
    list: (filters?: { status?: string; q?: string }) =>
      [...queryKeys.messages.all, "list", filters || {}] as const,
    counts: () => [...queryKeys.messages.all, "counts"] as const,
  },
  public: {
    all: ["public"] as const,
    answers: (username: string) =>
      [...queryKeys.public.all, "answers", username] as const,
    suggestions: () => [...queryKeys.public.all, "suggestions"] as const,
  },
  user: {
    all: ["user"] as const,
    acceptance: () => [...queryKeys.user.all, "acceptance"] as const,
    notifications: () => [...queryKeys.user.all, "notifications"] as const,
    blockedSenders: () => [...queryKeys.user.all, "blocked-senders"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    preferences: () => [...queryKeys.user.all, "preferences"] as const,
  },
  auth: {
    all: ["auth"] as const,
    checkUsername: (username: string) =>
      [...queryKeys.auth.all, "check-username", username] as const,
  },
} as const;
