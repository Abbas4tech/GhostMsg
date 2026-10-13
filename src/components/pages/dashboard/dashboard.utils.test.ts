import { describe, expect, it } from "vitest";
import { getActiveNav, stripProtocol, toLinkPrefix } from "./dashboard.utils";

describe("getActiveNav", () => {
  it("maps dashboard routes to sidebar items", () => {
    expect(getActiveNav("/dashboard")).toBe("inbox");
    expect(getActiveNav("/dashboard/profile")).toBe("profile");
    expect(getActiveNav("/dashboard/settings")).toBe("settings");
    expect(getActiveNav(null)).toBe("inbox");
  });
});

describe("stripProtocol", () => {
  it("drops http(s)://", () => {
    expect(stripProtocol("https://ghostmsg.app/u/maya")).toBe(
      "ghostmsg.app/u/maya"
    );
    expect(stripProtocol("http://localhost:3000/u/a")).toBe(
      "localhost:3000/u/a"
    );
  });
});

describe("toLinkPrefix", () => {
  it("keeps everything up to the username", () => {
    expect(toLinkPrefix("ghostmsg.app/u/maya")).toBe("ghostmsg.app/u/");
  });
});
