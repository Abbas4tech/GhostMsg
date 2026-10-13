import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useClaimLinkController } from "./use-claim-link.controller";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("useClaimLinkController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens sign-up with the typed username", () => {
    const { result } = renderHook(() => useClaimLinkController());

    act(() => result.current.setUsername("maya"));
    act(() => result.current.handleSubmit());

    expect(push).toHaveBeenCalledWith("/sign-up?username=maya");
  });

  it("shows the current host as the link prefix", () => {
    const { result } = renderHook(() => useClaimLinkController());
    expect(result.current.linkPrefix).toBe(`${window.location.host}/u/`);
  });
});
