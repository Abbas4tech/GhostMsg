/**
 * Generates docs/11-component-registry.md from the source tree so the
 * component inventory can never drift from the code.
 *
 *   pnpm docs:registry         → (re)write the registry
 *   pnpm docs:registry:check   → exit 1 if the committed registry is stale
 *
 * Covers every module in src/components/{elements,patterns,blocks,pages},
 * the fixture builders in src/mock/fixtures and the MSW scenarios in
 * src/mock/handlers.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const COMPONENTS_DIR = path.join(ROOT, "src/components");
const FIXTURES_DIR = path.join(ROOT, "src/mock/fixtures");
const OUTPUT = path.join(ROOT, "docs/11-component-registry.md");

const TIERS = [
  {
    key: "elements",
    label: "Tier 1 · Elements",
    rule: "Domain-agnostic primitives; defaults are pixel-identical to the original shadcn/Animate UI look.",
  },
  {
    key: "patterns",
    label: "Tier 2 · Patterns",
    rule: "Pure, domain-aware compositions of elements. Data in, callbacks out.",
  },
  {
    key: "blocks",
    label: "Tier 3 · Blocks",
    rule: "Pure page sections composing patterns (slots + grouped props).",
  },
  {
    key: "pages",
    label: "Tier 4 · Pages",
    rule: "Route components; the only tier with business logic (controllers).",
  },
] as const;

const STORY_EXPORT_REGEX = /^export const (\w+): Story\b/gm;
const PLAY_REGEX = /\bplay: async\b/g;
const TITLE_REGEX = /title: "([^"]+)"/;
const NAMED_EXPORT_BLOCK_REGEX = /export\s*\{([^}]*)\}\s*from/g;
const EXPORT_CONST_REGEX = /^export const (\w+)/gm;
const EXPORT_FUNCTION_REGEX = /^export (?:async )?function (\w+)/gm;
const EXPORT_TYPE_REGEX = /^export (?:type|interface) (\w+)/gm;
const CONTROLLER_REGEX = /^export function (use\w+Controller)\b/gm;
const WHITESPACE_REGEX = /\s+/;

const read = (file: string): string => fs.readFileSync(file, "utf-8");

const matchAll = (source: string, regex: RegExp): string[] =>
  Array.from(source.matchAll(regex), (m) => m[1]);

const listFiles = (dir: string): string[] =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? listFiles(full) : [full];
      })
    : [];

const rel = (file: string): string =>
  path.relative(ROOT, file).split(path.sep).join("/");

/** Public names re-exported from a module's index.ts (types marked with `type`). */
function publicApi(indexFile: string): string[] {
  if (!fs.existsSync(indexFile)) {
    return [];
  }
  return matchAll(read(indexFile), NAMED_EXPORT_BLOCK_REGEX)
    .flatMap((block) => block.split(","))
    .map((name) => name.trim().split(WHITESPACE_REGEX).join(" "))
    .filter(Boolean)
    .map((name) =>
      name.startsWith("type ") ? `${name.slice(5)} (type)` : name
    );
}

interface ModuleInfo {
  controllers: string[];
  dir: string;
  exports: string[];
  hasIndex: boolean;
  mockExports: string[];
  mockFiles: string[];
  name: string;
  playCount: number;
  storyFiles: { file: string; stories: string[]; title: string }[];
  testFiles: string[];
}

/** A module is a direct child folder of a tier (pages: any folder holding an index.ts). */
function moduleDirs(tierDir: string, tier: string): string[] {
  if (tier !== "pages") {
    return fs
      .readdirSync(tierDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(tierDir, entry.name));
  }
  const dirs = new Set<string>();
  for (const file of listFiles(tierDir)) {
    if (path.basename(file) === "index.ts" || file.endsWith(".controller.ts")) {
      dirs.add(path.dirname(file));
    }
  }
  return [...dirs];
}

function describeModule(dir: string, tierDir: string): ModuleInfo {
  const files = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(dir, entry.name));
  const storyFiles = files
    .filter((file) => file.endsWith(".stories.tsx"))
    .map((file) => {
      const source = read(file);
      return {
        file: path.basename(file),
        title: source.match(TITLE_REGEX)?.[1] ?? "(untitled)",
        stories: matchAll(source, STORY_EXPORT_REGEX),
      };
    });
  const mockFiles = files.filter((file) => file.endsWith(".mock.ts"));
  const controllers = files
    .filter((file) => file.endsWith(".controller.ts"))
    .flatMap((file) => matchAll(read(file), CONTROLLER_REGEX));

  return {
    name: rel(dir).replace(`${rel(tierDir)}/`, ""),
    dir: rel(dir),
    hasIndex: files.some((file) => path.basename(file) === "index.ts"),
    exports: publicApi(path.join(dir, "index.ts")),
    storyFiles,
    playCount: files
      .filter((file) => file.endsWith(".stories.tsx"))
      .reduce(
        (sum, file) => sum + (read(file).match(PLAY_REGEX)?.length ?? 0),
        0
      ),
    mockFiles: mockFiles.map((file) => path.basename(file)),
    mockExports: mockFiles.flatMap((file) =>
      matchAll(read(file), EXPORT_CONST_REGEX)
    ),
    testFiles: files
      .filter((file) => file.endsWith(".test.tsx") || file.endsWith(".test.ts"))
      .map((file) => path.basename(file)),
    controllers,
  };
}

const code = (items: string[]): string =>
  items.length ? items.map((item) => `\`${item}\``).join(", ") : "—";

function renderTier(tier: (typeof TIERS)[number]): {
  md: string;
  totals: number[];
} {
  const tierDir = path.join(COMPONENTS_DIR, tier.key);
  const modules = moduleDirs(tierDir, tier.key)
    .map((dir) => describeModule(dir, tierDir))
    .sort((a, b) => a.name.localeCompare(b.name));

  const storyCount = modules.reduce(
    (sum, m) => sum + m.storyFiles.reduce((s, f) => s + f.stories.length, 0),
    0
  );
  const playCount = modules.reduce((sum, m) => sum + m.playCount, 0);

  const summary = [
    `### ${tier.label} (\`src/components/${tier.key}/\`)`,
    "",
    `> ${tier.rule}`,
    "",
    `**${modules.length} modules · ${storyCount} stories · ${playCount} play() tests**`,
    "",
    "| Module | index.ts | Stories | play() | Mocks | Tests |",
    "| :--- | :---: | :---: | :---: | :---: | :---: |",
    ...modules.map((m) => {
      const stories = m.storyFiles.reduce((s, f) => s + f.stories.length, 0);
      return `| [\`${m.name}\`](../${m.dir}) | ${m.hasIndex ? "✅" : "—"} | ${stories} | ${m.playCount} | ${m.mockFiles.length} | ${m.testFiles.length} |`;
    }),
    "",
  ];

  const details = modules.flatMap((m) => [
    `#### \`${tier.key}/${m.name}\``,
    "",
    `- **Public API (index.ts):** ${code(m.exports)}`,
    ...(m.controllers.length
      ? [`- **Controllers:** ${code(m.controllers)}`]
      : []),
    ...m.storyFiles.map(
      (f) => `- **Stories** \`${f.file}\` → _${f.title}_: ${code(f.stories)}`
    ),
    `- **Mocks:** ${m.mockFiles.length ? `${code(m.mockFiles)} → ${code(m.mockExports)}` : "—"}`,
    ...(m.testFiles.length ? [`- **Unit tests:** ${code(m.testFiles)}`] : []),
    "",
  ]);

  return {
    md: [...summary, ...details].join("\n"),
    totals: [modules.length, storyCount, playCount],
  };
}

function renderFixtures(): string {
  const files = listFiles(FIXTURES_DIR)
    .filter((file) => file.endsWith(".fixtures.ts"))
    .sort();
  const rows = files.map((file) => {
    const source = read(file);
    const values = [
      ...matchAll(source, EXPORT_CONST_REGEX),
      ...matchAll(source, EXPORT_FUNCTION_REGEX),
    ];
    const types = matchAll(source, EXPORT_TYPE_REGEX);
    return `| [\`${path.basename(file)}\`](../${rel(file)}) | ${code(values)} | ${code(types)} |`;
  });
  return [
    "## Fixtures (`src/mock/fixtures/`)",
    "",
    "Single source of mock domain data for stories, MSW handlers and tests.",
    "",
    "| File | Builders & datasets | Types |",
    "| :--- | :--- | :--- |",
    ...rows,
    "",
  ].join("\n");
}

/** Imports the real `scenarios` object so the table is exact by construction. */
async function renderScenarios(): Promise<string> {
  const { scenarios } = (await import("../src/mock/handlers")) as {
    scenarios: Record<string, Record<string, unknown>>;
  };
  const rows = Object.entries(scenarios).map(
    ([group, sets]) =>
      `| \`scenarios.${group}\` | ${code(Object.keys(sets).map((name) => `${group}.${name}`))} |`
  );
  return [
    "## MSW scenarios (`src/mock/handlers/`)",
    "",
    "Compose with `withScenario(...overrides)` (overrides first, then `defaultHandlers`). **Most specific override first**: MSW uses the first matching handler. `defaultHandlers` = signed-in recipient, mixed inbox, default settings, public answers, AI suggestions, successful send/sign-up/verify.",
    "",
    "| Group | Scenarios |",
    "| :--- | :--- |",
    ...rows,
    "",
  ].join("\n");
}

async function render(): Promise<string> {
  const tiers = TIERS.map(renderTier);
  const [modules, stories, plays] = tiers.reduce<number[]>(
    (acc, t) => acc.map((v, i) => v + t.totals[i]),
    [0, 0, 0]
  );
  return [
    "<!-- AUTO-GENERATED by scripts/generate-component-registry.ts — DO NOT EDIT. Run `pnpm docs:registry`. -->",
    "",
    "# Chapter 11: Component Registry",
    "",
    "Generated inventory of every component module, its public API, stories, interaction tests, mocks, controllers, plus the shared fixtures and MSW scenarios. Rules live in [Chapter 5](05-component-architecture.md), [Chapter 10](10-storybook-and-ui-catalog.md) and the [agent guide](agents/component-architecture.md).",
    "",
    `**Totals:** ${modules} modules · ${stories} stories · ${plays} play() interaction tests.`,
    "",
    "- Regenerate after adding/renaming a module, story, mock export or scenario: `pnpm docs:registry`.",
    "- `pnpm docs:registry:check` fails when this file is stale (part of the pre-push gate).",
    "",
    "---",
    "",
    "## Modules",
    "",
    ...tiers.map((t) => t.md),
    "---",
    "",
    renderFixtures(),
    await renderScenarios(),
  ].join("\n");
}

async function main(): Promise<void> {
  const output = await render();

  if (process.argv.includes("--check")) {
    const current = fs.existsSync(OUTPUT)
      ? read(OUTPUT).replace(/\r\n/g, "\n")
      : "";
    if (current.trim() !== output.trim()) {
      console.error(
        "docs/11-component-registry.md is stale. Run `pnpm docs:registry`."
      );
      process.exit(1);
    }
    console.log("Component registry is up to date.");
  } else {
    fs.writeFileSync(OUTPUT, `${output.trim()}\n`, "utf-8");
    console.log(`Wrote ${rel(OUTPUT)}`);
  }
}

main().catch((error: unknown) => {
  console.error("Failed to generate the component registry:", error);
  process.exit(1);
});
