/**
 * Captures the documentation screenshots in docs/assets/screenshots/ from the
 * static Storybook build, so the docs always show the real UI.
 *
 *   pnpm build-storybook        → storybook-static/
 *   pnpm docs:screenshots       → docs/assets/screenshots/*.png
 *
 * Every shot renders a story in its iframe (MSW handlers and fixtures
 * included) with a fixed viewport, palette and colour mode. Motion is reduced
 * so animations settle before the capture. Add a shot to SHOTS and re-run.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();
const STATIC_DIR = path.join(ROOT, "storybook-static");
const OUTPUT_DIR = path.join(ROOT, "docs/assets/screenshots");
const PORT = 6106;
const SETTLE_MS = 1200;
const LEADING_SLASHES = /^\/+/;
const STORY_TIMEOUT_MS = 60_000;

type Palette = "spectral" | "midnight" | "paper";
type Mode = "light" | "dark";

interface Viewport {
  height: number;
  width: number;
}

const DESKTOP: Viewport = { height: 900, width: 1440 };
const LAPTOP: Viewport = { height: 800, width: 1280 };
const MOBILE: Viewport = { height: 844, width: 390 };
const DIALOG: Viewport = { height: 820, width: 1100 };

interface Shot {
  /** Capture the whole scrollable page instead of the viewport. */
  fullPage?: boolean;
  mode?: Mode;
  /** File name without extension. */
  name: string;
  palette?: Palette;
  /** Storybook story id, e.g. "pages-dashboard--inbox". */
  story: string;
  viewport: Viewport;
}

const PALETTE_MATRIX: Shot[] = (["spectral", "midnight", "paper"] as const)
  .flatMap((palette) =>
    (["light", "dark"] as const).map((mode) => ({ mode, palette }))
  )
  .map(({ palette, mode }) => ({
    mode,
    name: `palette-${palette}-${mode}`,
    palette,
    story: "pages-dashboard--inbox",
    viewport: LAPTOP,
  }));

const SHOTS: Shot[] = [
  // Marketing + auth
  {
    fullPage: true,
    name: "landing",
    story: "pages-home--guest",
    viewport: DESKTOP,
  },
  { name: "landing-mobile", story: "pages-home--guest", viewport: MOBILE },
  { name: "sign-in", story: "pages-auth-signin--default", viewport: DESKTOP },
  { name: "sign-up", story: "pages-auth-signup--default", viewport: DESKTOP },
  { name: "verify", story: "pages-auth-verify--default", viewport: DESKTOP },
  // Dashboard
  {
    name: "dashboard-inbox",
    story: "pages-dashboard--inbox",
    viewport: DESKTOP,
  },
  {
    mode: "dark",
    name: "dashboard-inbox-dark",
    story: "pages-dashboard--inbox",
    viewport: DESKTOP,
  },
  {
    name: "dashboard-inbox-mobile",
    story: "pages-dashboard--mobile",
    viewport: MOBILE,
  },
  {
    name: "dashboard-empty",
    story: "pages-dashboard--empty-inbox",
    viewport: DESKTOP,
  },
  {
    fullPage: true,
    name: "dashboard-profile",
    story: "pages-dashboard--profile",
    viewport: DESKTOP,
  },
  {
    fullPage: true,
    name: "dashboard-settings",
    story: "pages-dashboard--settings",
    viewport: DESKTOP,
  },
  {
    name: "dashboard-signed-out",
    story: "pages-dashboard--signed-out",
    viewport: DESKTOP,
  },
  // Public profile
  {
    fullPage: true,
    name: "public-profile",
    story: "pages-publicprofile--default",
    viewport: MOBILE,
  },
  {
    name: "public-profile-paused",
    story: "pages-publicprofile--paused",
    viewport: MOBILE,
  },
  {
    name: "public-profile-not-found",
    story: "pages-publicprofile--user-not-found",
    viewport: MOBILE,
  },
  // Dialogs
  {
    name: "modal-smart-reply",
    story: "patterns-modals-smartreplymodal--new-reply",
    viewport: DIALOG,
  },
  {
    name: "modal-story-card",
    story: "patterns-modals-storycardmodal--with-answer",
    viewport: DIALOG,
  },
  {
    name: "modal-reveal",
    story: "patterns-modals-revealmessagemodal--keep-hidden-is-default",
    viewport: DIALOG,
  },
  {
    name: "modal-change-username",
    story: "patterns-modals-changeusernamemodal--available",
    viewport: DIALOG,
  },
  {
    name: "modal-delete-account",
    story: "patterns-modals-deleteaccountmodal--type-to-confirm",
    viewport: DIALOG,
  },
  {
    name: "modal-command-palette",
    story: "patterns-commandpalette--arrow-keys",
    viewport: DIALOG,
  },
  ...PALETTE_MATRIX,
];

const MIME: Record<string, string> = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mjs": "text/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

/** Minimal static file server for storybook-static/. */
function serveStatic(): Promise<http.Server> {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url ?? "/", `http://localhost:${PORT}`);
    const relative = decodeURIComponent(url.pathname).replace(
      LEADING_SLASHES,
      ""
    );
    const filePath = path.join(STATIC_DIR, relative || "index.html");
    if (!(filePath.startsWith(STATIC_DIR) && fs.existsSync(filePath))) {
      response.writeHead(404).end();
      return;
    }
    const target = fs.statSync(filePath).isDirectory()
      ? path.join(filePath, "index.html")
      : filePath;
    response.writeHead(200, {
      "Content-Type": MIME[path.extname(target)] ?? "application/octet-stream",
    });
    fs.createReadStream(target).pipe(response);
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

const storyUrl = (shot: Shot): string => {
  const globals = `palette:${shot.palette ?? "spectral"};theme:${shot.mode ?? "light"}`;
  return `http://localhost:${PORT}/iframe.html?id=${shot.story}&viewMode=story&globals=${globals}`;
};

async function main(): Promise<void> {
  if (!fs.existsSync(path.join(STATIC_DIR, "iframe.html"))) {
    throw new Error(
      "storybook-static/ is missing: run `pnpm build-storybook` first."
    );
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const only = process.argv.slice(2);
  const shots =
    only.length > 0 ? SHOTS.filter((s) => only.includes(s.name)) : SHOTS;

  const server = await serveStatic();
  const browser = await chromium.launch();
  // One context: MSW's service worker registers once and serves every story.
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const failures: string[] = [];
  try {
    for (const shot of shots) {
      const page = await context.newPage();
      await page.setViewportSize(shot.viewport);
      try {
        await page.goto(storyUrl(shot), {
          timeout: STORY_TIMEOUT_MS,
          waitUntil: "networkidle",
        });
        // Storybook marks the render "finished" after loaders, render and play().
        await page.waitForFunction(
          () => {
            const phase = (
              window as unknown as {
                __STORYBOOK_PREVIEW__?: { currentRender?: { phase?: string } };
              }
            ).__STORYBOOK_PREVIEW__?.currentRender?.phase;
            return phase === "finished" || phase === "completed";
          },
          undefined,
          { timeout: STORY_TIMEOUT_MS }
        );
        await page.waitForTimeout(SETTLE_MS);
        await page.screenshot({
          fullPage: shot.fullPage ?? false,
          path: path.join(OUTPUT_DIR, `${shot.name}.png`),
        });
        process.stdout.write(`✓ ${shot.name}\n`);
      } catch (error) {
        failures.push(shot.name);
        process.stdout.write(
          `✗ ${shot.name}: ${(error as Error).message.split("\n")[0]}\n`
        );
      } finally {
        await page.close();
      }
    }
  } finally {
    await context.close();
    await browser.close();
    server.close();
  }
  if (failures.length > 0) {
    process.stdout.write(
      `\n${failures.length} screenshot(s) failed: ${failures.join(", ")}\n`
    );
    process.exitCode = 1;
  }
}

main();
