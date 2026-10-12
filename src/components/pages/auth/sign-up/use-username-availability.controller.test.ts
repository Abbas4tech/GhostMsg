import { act, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";
import type { SignUpValues } from "@/components/patterns/auth-form";
import { scenarios } from "@/mock/handlers";
import { server } from "@/test/msw-server";
import { recordRequests, renderHookWithProviders } from "@/test/test-utils";
import { useUsernameAvailabilityController } from "./use-username-availability.controller";

function useHarness() {
  const form = useForm<SignUpValues>({
    defaultValues: { username: "", email: "", password: "" },
  });
  return { form, ...useUsernameAvailabilityController(form) };
}

describe("useUsernameAvailabilityController", () => {
  it("stays idle and skips the request for names shorter than 2 characters", async () => {
    const requests = recordRequests();
    const { result } = renderHookWithProviders(useHarness);

    act(() => result.current.form.setValue("username", "a"));

    // Longer than the debounce, so a request would have been sent by now.
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(result.current.availability).toBe("idle");
    expect(requests).toEqual([]);
  });

  it("reports an available name and clears the field error", async () => {
    const { result } = renderHookWithProviders(useHarness);

    act(() => {
      result.current.form.setError("username", { message: "stale" });
      result.current.form.setValue("username", "freeghost");
    });

    await waitFor(() => expect(result.current.availability).toBe("available"));
    expect(result.current.form.getFieldState("username").error).toBeUndefined();
  });

  it("reports a taken name and writes the server message into the form", async () => {
    server.use(...scenarios.username.taken);
    const { result } = renderHookWithProviders(useHarness);

    act(() => result.current.form.setValue("username", "johndoe"));

    await waitFor(() => expect(result.current.availability).toBe("taken"));
    expect(result.current.availabilityMessage).toBe(
      "Username is already taken"
    );
    expect(result.current.form.getFieldState("username").error?.message).toBe(
      "Username is already taken"
    );
  });
});
