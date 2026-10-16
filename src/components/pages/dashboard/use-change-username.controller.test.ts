import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FIXTURE_USERNAME } from "@/mock/fixtures/public-profile.fixtures";
import { scenarios } from "@/mock/handlers";
import { server } from "@/test/msw-server";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";
import { useChangeUsernameController } from "./use-change-username.controller";

const { refresh, update } = vi.hoisted(() => ({
  refresh: vi.fn(),
  update: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("next-auth/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next-auth/react")>()),
  useSession: () => ({ update }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const NEW_USERNAME = "maya_writes";

describe("useChangeUsernameController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens prefilled with the current username, which reads as idle", () => {
    const { result } = renderHookWithProviders(() =>
      useChangeUsernameController(FIXTURE_USERNAME)
    );

    act(() => result.current.open());

    expect(result.current.isOpen).toBe(true);
    expect(result.current.value).toBe(FIXTURE_USERNAME);
    expect(result.current.availability).toBe("idle");
  });

  it("reports an available username after the debounce", async () => {
    const { result } = renderHookWithProviders(() =>
      useChangeUsernameController(FIXTURE_USERNAME)
    );

    act(() => result.current.setValue(NEW_USERNAME));
    expect(result.current.availability).toBe("checking");

    await waitFor(() => expect(result.current.availability).toBe("available"));
  });

  it("reports a taken username", async () => {
    server.use(...scenarios.username.taken);
    const { result } = renderHookWithProviders(() =>
      useChangeUsernameController(FIXTURE_USERNAME)
    );

    act(() => result.current.setValue(NEW_USERNAME));

    await waitFor(() => expect(result.current.availability).toBe("taken"));
  });

  it("saves, refreshes the session and closes", async () => {
    const requests = recordRequests();
    const { result } = renderHookWithProviders(() =>
      useChangeUsernameController(FIXTURE_USERNAME)
    );

    act(() => result.current.open());
    act(() => result.current.setValue(`  ${NEW_USERNAME} `));
    await act(() => result.current.handleSubmit());

    expect(requests).toContain("PATCH /api/user/username");
    expect(update).toHaveBeenCalledWith({ username: NEW_USERNAME });
    expect(refresh).toHaveBeenCalledOnce();
    expect(result.current.isOpen).toBe(false);
  });
});
