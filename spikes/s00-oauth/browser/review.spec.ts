import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, type Page, test } from "@playwright/test";

interface Host {
  notify(): void;
  remount(publicOnly?: boolean): void;
  control(mode: string): Promise<void>;
  stats(): Promise<{ commits: number; accepted: number; statusReads: number }>;
}
const host = (page: Page, action: string) =>
  page.evaluate(async (action) => {
    const harness = (window as unknown as { harness: Host }).harness;
    if (action === "notify") harness.notify();
    else if (action === "remount") harness.remount();
    else if (action === "public-remount") harness.remount(true);
    else await harness.control(action);
  }, action);
const stats = (page: Page) =>
  page.evaluate(() => (window as unknown as { harness: Host }).harness.stats());
const view = (page: Page) =>
  page.frameLocator('iframe[title="Synthetic MCP Apps review"]');
const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type()))
      errors.push(message.text());
  });
  await page.goto(`/?case=${randomUUID()}`);
  await expect(
    view(page).getByRole("button", {
      name: "Godkänn testförslaget",
      exact: true,
    }),
  ).toBeEnabled();
});
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});

test("restrictive CSP: render, approve once, reload and reject stale/remounted approvals", async ({
  page,
}, info) => {
  await expect(page).toHaveTitle("Synthetic review host");
  await expect(view(page).getByRole("heading")).toHaveText(
    "Granska syntetiskt förslag",
  );
  await expect(view(page).locator("#summary")).toContainText(
    "Syntetiskt testföretag A",
  );
  await expect(view(page).locator("#difference")).toHaveText(
    "Differens: 0.00 SEK",
  );
  const approve = view(page).getByRole("button", {
    name: "Godkänn testförslaget",
    exact: true,
  });
  await approve.focus();
  await page.keyboard.press("Enter");
  await expect(view(page).getByRole("status")).toContainText(
    "registrerades en gång",
  );
  await expect(approve).toBeDisabled();
  await host(page, "notify");
  await expect(approve).toBeDisabled();
  await host(page, "public-remount");
  await expect(view(page).getByRole("status")).toContainText(
    "registrerades en gång",
  );
  await page.reload();
  await expect(view(page).getByRole("status")).toContainText(
    "registrerades en gång",
  );
  await expect(
    view(page).getByRole("button", {
      name: "Godkänn testförslaget",
      exact: true,
    }),
  ).toBeDisabled();
  expect(await stats(page)).toMatchObject({ commits: 1, accepted: 1 });
  await view(page).getByLabel("Språk / Language").selectOption("en");
  await expect(view(page).getByRole("status")).toContainText("recorded once");
  const frame = page.frames().find((frame) => frame.url().endsWith("/widget"));
  expect(frame).toBeDefined();
  expect(
    await frame?.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: join(tmpdir(), `fortnox-s00-${info.project.name}-completed.png`),
    fullPage: true,
  });
});

test("two open views share one atomic commit even when a stale button is clicked", async ({
  page,
  context,
}) => {
  const second = await context.newPage();
  await second.goto(page.url());
  const firstButton = view(page).locator("#approve");
  const secondButton = view(second).locator("#approve");
  await expect(secondButton).toBeEnabled();
  await Promise.all([firstButton.click(), secondButton.click()]);
  await expect(view(page).getByRole("status")).toContainText(
    "registrerades en gång",
  );
  await expect(view(second).getByRole("status")).toContainText(
    "registrerades en gång",
  );
  expect(await stats(page)).toMatchObject({ commits: 2, accepted: 1 });
});

test("confirmed consumption wins over local expiry during a slow remount read", async ({
  page,
  context,
}) => {
  const second = await context.newPage();
  await second.goto(page.url());
  await view(second).locator("#approve").click();
  await expect(view(second).getByRole("status")).toContainText(
    "registrerades en gång",
  );
  await host(page, "slow-status");
  await page.clock.setFixedTime(new Date(Date.now() + 11 * 60_000));
  await host(page, "remount");
  await expect(view(page).getByRole("status")).toContainText(
    "registrerades en gång",
  );
  await expect(view(page).locator("#approve")).toBeDisabled();
  expect(await stats(page)).toMatchObject({ commits: 1, accepted: 1 });
});

test("lost commit response reconciles without a second commit", async ({
  page,
}) => {
  await host(page, "lost-response");
  await view(page).locator("#approve").click();
  await expect(view(page).getByRole("status")).toContainText(
    "Skickar testgodkännandet",
  );
  // Exercise the real 15-second bridge timeout, not a synthetic error result.
  await expect(view(page).getByRole("status")).toContainText(
    "registrerades en gång",
    { timeout: 20000 },
  );
  expect(await stats(page)).toMatchObject({ commits: 1, accepted: 1 });
});

test("a double click and duplicate tool result cannot submit the view twice", async ({
  page,
}) => {
  await host(page, "notify");
  await view(page)
    .locator("#approve")
    .evaluate((button) => {
      (button as HTMLButtonElement).click();
      (button as HTMLButtonElement).click();
    });
  await expect(view(page).getByRole("status")).toContainText(
    "registrerades en gång",
  );
  expect(await stats(page)).toMatchObject({ commits: 1, accepted: 1 });
});

test("unknown outcome remains disabled through late results and failed status reads", async ({
  page,
}) => {
  await host(page, "unknown-offline");
  await view(page).locator("#approve").click();
  await expect(view(page).getByRole("status")).toContainText(
    "Utfallet är okänt",
  );
  await host(page, "notify");
  await expect(view(page).locator("#approve")).toBeDisabled();
  await host(page, "normal");
  await view(page).locator("#refresh").click();
  await expect(view(page).getByRole("status")).toContainText(
    "Utfallet är okänt",
  );
  await expect(view(page).locator("#approve")).toBeDisabled();
  expect(await stats(page)).toMatchObject({ commits: 1, accepted: 0 });
});

test("remount without private metadata cannot renew approval; expired references stay disabled", async ({
  page,
}) => {
  await host(page, "public-remount");
  await expect(view(page).getByRole("status")).toContainText(
    "saknar ett giltigt godkännandebevis",
  );
  await expect(view(page).locator("#approve")).toBeDisabled();
  await host(page, "notify");
  await expect(view(page).locator("#approve")).toBeDisabled();
  await host(page, "expire");
  await view(page).locator("#refresh").click();
  await expect(view(page).getByRole("status")).toContainText("har gått ut");
  expect(await stats(page)).toMatchObject({ commits: 0, accepted: 0 });
});

test("status outage blocks approval until a successful read", async ({
  page,
}) => {
  await host(page, "status-error");
  await host(page, "remount");
  await expect(view(page).getByRole("status")).toContainText(
    "status kan inte hämtas",
  );
  await expect(view(page).locator("#approve")).toBeDisabled();
  await host(page, "normal");
  await view(page).locator("#refresh").click();
  await expect(view(page).locator("#approve")).toBeEnabled();
  expect(await stats(page)).toMatchObject({ commits: 0, accepted: 0 });
});

test("without a parent host the resource remains readable with approval disabled", async ({
  page,
}) => {
  await page.goto("/widget");
  await expect(page).toHaveTitle("S00 – granskning");
  await expect(page.getByRole("heading")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Klienten saknar");
  await expect(page.locator("#approve")).toBeDisabled();
});
