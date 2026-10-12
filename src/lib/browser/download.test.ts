import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadTextFile } from "./download";

describe("downloadTextFile", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("clicks an anchor with an encoded data URL and the filename", () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    const createElement = vi.spyOn(document, "createElement");

    downloadTextFile({
      content: "a,b\n1,2",
      filename: "x.csv",
      mimeType: "text/csv",
    });

    const anchor = createElement.mock.results[0].value as HTMLAnchorElement;
    expect(anchor.getAttribute("download")).toBe("x.csv");
    expect(anchor.getAttribute("href")).toBe(
      `data:text/csv;charset=utf-8,${encodeURIComponent("a,b\n1,2")}`
    );
    expect(click).toHaveBeenCalledOnce();
  });
});
