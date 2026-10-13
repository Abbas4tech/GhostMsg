import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./msw-server";

// happy-dom rejects an Animation's `finished` promise when it is cancelled
// (Motion cancels WAAPI animations on unmount/retarget). Browsers surface the
// same rejection, but Motion never awaits it, so under test it leaks as an
// unhandled rejection. Mark `finished` as handled for every animation.
const nativeAnimate = Element.prototype.animate;
if (typeof nativeAnimate === "function") {
  Element.prototype.animate = function animate(
    this: Element,
    ...args: Parameters<Element["animate"]>
  ): Animation {
    const animation = nativeAnimate.apply(this, args);
    animation.finished?.catch(() => undefined);
    return animation;
  };
}

// Network isolation (ADR 0016, Q11): every request is answered by MSW; an
// unhandled request fails the test instead of silently hitting the network.
// Listen at module load (not beforeAll) so fetch is patched before any app
// module (e.g. the openapi-fetch client) captures a reference to it.
server.listen({ onUnhandledRequest: "error" });
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

// Polyfill window.atob and btoa if not present
if (typeof window.atob === "undefined") {
  window.atob = (str: string) => Buffer.from(str, "base64").toString("binary");
}

if (typeof window.btoa === "undefined") {
  window.btoa = (str: string) => Buffer.from(str, "binary").toString("base64");
}

// Polyfill ResizeObserver
if (typeof window.ResizeObserver === "undefined") {
  class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  window.ResizeObserver = ResizeObserver;
}

// Polyfill IntersectionObserver
if (typeof window.IntersectionObserver === "undefined") {
  class IntersectionObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  window.IntersectionObserver =
    IntersectionObserver as unknown as typeof window.IntersectionObserver;
}

// Polyfill Notification & ServiceWorker Push APIs
beforeAll(() => {
  if (!("Notification" in window)) {
    Object.defineProperty(window, "Notification", {
      writable: true,
      value: {
        requestPermission: vi.fn().mockResolvedValue("granted"),
        permission: "granted",
      },
    });
  }

  if (!("serviceWorker" in navigator)) {
    Object.defineProperty(navigator, "serviceWorker", {
      writable: true,
      value: {
        register: vi.fn().mockResolvedValue({
          pushManager: {
            getSubscription: vi.fn().mockResolvedValue(null),
            subscribe: vi.fn().mockResolvedValue({
              toJSON: () => ({
                endpoint: "https://push.example.com/sub/123",
                keys: { p256dh: "mockP256", auth: "mockAuth" },
              }),
            }),
          },
        }),
        getRegistration: vi.fn().mockResolvedValue(null),
        ready: Promise.resolve({
          pushManager: {
            getSubscription: vi.fn().mockResolvedValue(null),
            subscribe: vi.fn().mockResolvedValue({
              toJSON: () => ({
                endpoint: "https://push.example.com/sub/123",
                keys: { p256dh: "mockP256", auth: "mockAuth" },
              }),
            }),
          },
        }),
      },
    });
  }

  if (!("PushManager" in window)) {
    Object.defineProperty(window, "PushManager", {
      writable: true,
      value: class PushManager {},
    });
  }
});
