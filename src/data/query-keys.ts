export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    checkUsername: (username: string) =>
      [...queryKeys.auth.all, "check-username", username] as const,
  },
  messages: {
    all: ["messages"] as const,
    counts: () => [...queryKeys.messages.all, "counts"] as const,
    list: (filters?: { status?: string; q?: string }) =>
      [...queryKeys.messages.all, "list", filters || {}] as const,
  },
  public: {
    all: ["public"] as const,
    answers: (username: string) =>
      [...queryKeys.public.all, "answers", username] as const,
    suggestions: () => [...queryKeys.public.all, "suggestions"] as const,
  },
  user: {
    acceptance: () => [...queryKeys.user.all, "acceptance"] as const,
    all: ["user"] as const,
    blockedSenders: () => [...queryKeys.user.all, "blocked-senders"] as const,
    notifications: () => [...queryKeys.user.all, "notifications"] as const,
    preferences: () => [...queryKeys.user.all, "preferences"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
  },
} as const;
