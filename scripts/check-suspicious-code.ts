/**
 * Supply-chain guard: fails when a tracked file looks like the obfuscated
 * "download and eval" payload that was once hidden in `postcss.config.mjs`
 * and in a fake `.eot` font (see docs/28-supply-chain-security.md).
 *
 *   pnpm security:check   → prints every finding, exit 1 if there is any
 *
 * It reads only; it never runs or evals anything it scans. Signatures are
 * built from fragments so this file never matches itself.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SELF = "scripts/check-suspicious-code.ts";

interface Finding {
  file: string;
  reason: string;
}

/** Strings from the known payload (split so the source doesn't contain them). */
const KNOWN_SIGNATURES = [
  ["em0ZJl7u", "ATsA"],
  ["global['r']", "=require"],
  ["x-payload", "-b64"],
  ["eth_getBlock", "ByNumber"],
  ["ETH_RPC", "_URL"],
].map((parts) => parts.join(""));

/** Code or assets that must never read the environment or spawn processes. */
const ASSET_EXTENSIONS = new Set([
  ".eot",
  ".ico",
  ".jpeg",
  ".jpg",
  ".png",
  ".ttf",
  ".webp",
  ".woff",
  ".woff2",
]);
const ASSET_CODE_MARKERS = [
  "require(",
  "child_process",
  "process.env",
  "eval(",
  "new Function(",
].map((marker) => marker);

const SCRIPT_EXTENSIONS = new Set([
  ".cjs",
  ".js",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
]);
const LONG_LINE = 1500;
const MAX_GIT_OUTPUT_BYTES = 64 * 1024 * 1024;
const AUTO_TASKS_ENABLED = /allowAutomaticTasks"\s*:\s*true/;
const OBFUSCATION = /\[['"](?:fromCharCode|charCodeAt)['"]\]/;
const LIFECYCLE = ["preinstall", "install", "postinstall"] as const;

const trackedFiles = (): string[] =>
  execFileSync("git", ["ls-files", "-z"], {
    cwd: ROOT,
    maxBuffer: MAX_GIT_OUTPUT_BYTES,
  })
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .filter((file) => file !== SELF && fs.existsSync(path.join(ROOT, file)));

const read = (file: string): string =>
  fs.readFileSync(path.join(ROOT, file)).toString("latin1");

function checkSignatures(file: string, text: string): Finding[] {
  return KNOWN_SIGNATURES.filter((sig) => text.includes(sig)).map((sig) => ({
    file,
    reason: `contains a known payload marker (${sig.slice(0, 6)}…)`,
  }));
}

function checkAsset(file: string, text: string): Finding[] {
  if (!ASSET_EXTENSIONS.has(path.extname(file).toLowerCase())) {
    return [];
  }
  const hit = ASSET_CODE_MARKERS.find((marker) => text.includes(marker));
  return hit
    ? [
        {
          file,
          reason: `binary asset embeds code (${hit}): not a real font or image`,
        },
      ]
    : [];
}

function checkObfuscatedScript(file: string, text: string): Finding[] {
  if (!SCRIPT_EXTENSIONS.has(path.extname(file))) {
    return [];
  }
  const longLine = text.split("\n").some((line) => line.length > LONG_LINE);
  return longLine && OBFUSCATION.test(text)
    ? [
        {
          file,
          reason: `obfuscated code (a line over ${LONG_LINE} characters using bracket-style charCode calls)`,
        },
      ]
    : [];
}

function checkEditorAndPackage(file: string, text: string): Finding[] {
  const findings: Finding[] = [];
  if (file === ".vscode/settings.json" && AUTO_TASKS_ENABLED.test(text)) {
    findings.push({
      file,
      reason:
        "task.allowAutomaticTasks lets folder-open tasks run without a prompt",
    });
  }
  if (file === ".vscode/tasks.json" && text.includes("folderOpen")) {
    findings.push({ file, reason: "a task runs on folder open" });
  }
  if (file === "package.json") {
    const scripts =
      (JSON.parse(text) as { scripts?: Record<string, string> }).scripts ?? {};
    for (const name of LIFECYCLE) {
      if (scripts[name]) {
        findings.push({
          file,
          reason: `"${name}" script runs on every install: ${scripts[name]}`,
        });
      }
    }
  }
  return findings;
}

function scan(file: string): Finding[] {
  const text = read(file);
  return [
    ...checkSignatures(file, text),
    ...checkAsset(file, text),
    ...checkObfuscatedScript(file, text),
    ...checkEditorAndPackage(file, text),
  ];
}

const findings = trackedFiles().flatMap(scan);

if (findings.length === 0) {
  console.log("security:check passed (no suspicious tracked files).");
} else {
  for (const { file, reason } of findings) {
    console.error(`✗ ${file}: ${reason}`);
  }
  console.error(
    `\nsecurity:check failed (${findings.length}). Do not run or build this branch until reviewed: docs/28-supply-chain-security.md`
  );
  process.exit(1);
}
