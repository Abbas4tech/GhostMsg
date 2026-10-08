export const queryKeys = {
  messages: {
    all: ["messages"] as const,
    list: (filters?: { status?: string; q?: string }) =>
      [...queryKeys.messages.all, "list", filters || {}] as const,
    detail: (id: string) => [...queryKeys.messages.all, "detail", id] as const,
  },
  public: {
    all: ["public"] as const,
    answers: (username: string) =>
      [...queryKeys.public.all, "answers", username] as const,
  },
  user: {
    all: ["user"] as const,
    acceptance: () => [...queryKeys.user.all, "acceptance"] as const,
    notifications: () => [...queryKeys.user.all, "notifications"] as const,
  },
  auth: {
    all: ["auth"] as const,
    checkUsername: (username: string) =>
      [...queryKeys.auth.all, "check-username", username] as const,
  },
} as const;
