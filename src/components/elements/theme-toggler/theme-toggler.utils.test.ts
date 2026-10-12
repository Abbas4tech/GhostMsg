import { describe, expect, it } from "vitest";
import { getNextTheme } from "./theme-toggler.utils";

describe("getNextTheme", () => {
  it("cycles through the configured modes and wraps around", () => {
    expect(getNextTheme("dark", ["dark", "light"])).toBe("light");
    expect(getNextTheme("light", ["dark", "light"])).toBe("dark");
    expect(getNextTheme("system", ["light", "dark", "system"])).toBe("light");
  });

  it("restarts at the first mode when the current one is not configured", () => {
    expect(getNextTheme("system", ["dark", "light"])).toBe("dark");
  });
});
