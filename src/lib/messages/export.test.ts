import { describe, expect, it } from "vitest";
import {
  answeredSpicyMessage,
  buildMessage,
  sweetMessage,
} from "@/mock/fixtures/messages.fixtures";
import {
  buildMessagesCsv,
  buildMessagesExport,
  buildMessagesJson,
} from "./export";

describe("buildMessagesCsv", () => {
  it("writes a header row and one row per message", () => {
    const lines = buildMessagesCsv([sweetMessage, answeredSpicyMessage]).split(
      "\n"
    );
    expect(lines[0]).toBe("ID,Content,Sentiment,Created At,Reply");
    expect(lines).toHaveLength(3);
    expect(lines[2]).toContain(`"${answeredSpicyMessage.reply?.text}"`);
  });

  it("escapes embedded double quotes and empties missing replies", () => {
    const csv = buildMessagesCsv([
      buildMessage({ content: 'He said "hi"', reply: null }),
    ]);
    expect(csv.split("\n")[1]).toContain('"He said ""hi"""');
    expect(csv.split("\n")[1].endsWith(',""')).toBe(true);
  });
});

describe("buildMessagesJson", () => {
  it("round-trips the messages", () => {
    expect(JSON.parse(buildMessagesJson([sweetMessage]))).toEqual([
      sweetMessage,
    ]);
  });
});

describe("buildMessagesExport", () => {
  it("builds a deterministic filename and MIME type per format", () => {
    expect(buildMessagesExport([sweetMessage], "csv", 42)).toMatchObject({
      filename: "ghostmsg-export-42.csv",
      mimeType: "text/csv",
    });
    expect(buildMessagesExport([sweetMessage], "json", 42)).toMatchObject({
      filename: "ghostmsg-export-42.json",
      mimeType: "text/json",
    });
  });
});
