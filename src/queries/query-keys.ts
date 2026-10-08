export const queryKeys = {
  messages: {
    all: ["messages"] as const,
    list: () => [...queryKeys.messages.all, "list"] as const,
    detail: (id: string) => [...queryKeys.messages.all, "detail", id] as const,
  },
  user: {
    all: ["user"] as const,
    acceptance: () => [...queryKeys.user.all, "acceptance"] as const,
  },
  auth: {
    all: ["auth"] as const,
    checkUsername: (username: string) =>
      [...queryKeys.auth.all, "check-username", username] as const,
  },
} as const;
