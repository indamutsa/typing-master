import { test, expect, Page } from "@playwright/test";

// Wait for Next.js client-side hydration to complete.
// The settings trigger is rendered by a "use client" component —
// once its onClick works (drawer opens), React has hydrated.
async function waitForHydration(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  // Wait until React hydration makes the settings button functional
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-testid="settings-trigger"]');
    // Check the element exists and has __reactFiber (React has attached)
    if (!el) return false;
    return Object.keys(el).some((k) => k.startsWith("__reactFiber") || k.startsWith("__reactProps"));
  }, { timeout: 10000 });
}

// Helper: navigate to free mode, fill text, and start session
async function startFreeSession(page: Page, text: string) {
  await page.goto("/free");
  await waitForHydration(page);
  await page.getByTestId("free-textarea").fill(text);
  await page.getByTestId("free-start-btn").click();
  await expect(page.getByTestId("text-display")).toBeVisible();
}

test.describe("Home Page — Mode Selector", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
  });

  test("renders TypeMaster title and subtitle", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("TypeMaster");
    await expect(page.locator("text=AI-powered typing trainer")).toBeVisible();
  });

  test("renders three mode cards", async ({ page }) => {
    const selector = page.getByTestId("mode-selector");
    await expect(selector).toBeVisible();
    await expect(page.getByTestId("mode-practice")).toBeVisible();
    await expect(page.getByTestId("mode-test")).toBeVisible();
    await expect(page.getByTestId("mode-free")).toBeVisible();
  });

  test("Practice card is accented (recommended)", async ({ page }) => {
    const practiceCard = page.getByTestId("mode-practice");
    await expect(practiceCard).toHaveClass(/border-amber/);
  });

  test("Test card shows duration picker with 30s and 60s buttons", async ({
    page,
  }) => {
    await expect(page.getByTestId("duration-30")).toBeVisible();
    await expect(page.getByTestId("duration-60")).toBeVisible();
    await expect(page.getByTestId("duration-custom")).toBeVisible();
  });

  test("stats strip renders at the bottom", async ({ page }) => {
    const strip = page.getByTestId("stats-strip");
    await expect(strip).toBeVisible();
    await expect(page.getByTestId("total-keystrokes")).toBeVisible();
    await expect(page.getByTestId("overall-accuracy")).toBeVisible();
    await expect(page.getByTestId("keys-tracked")).toBeVisible();
  });

  test("clicking Practice navigates to /practice", async ({ page }) => {
    await page.getByTestId("mode-practice").click();
    await expect(page).toHaveURL(/\/practice/);
  });

  test("clicking Test navigates to /test", async ({ page }) => {
    await page.getByTestId("mode-test").click();
    await expect(page).toHaveURL(/\/test/);
  });

  test("clicking Free navigates to /free", async ({ page }) => {
    await page.getByTestId("mode-free").click();
    await expect(page).toHaveURL(/\/free/);
  });
});

test.describe("Settings Drawer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
  });

  test("settings trigger button is visible", async ({ page }) => {
    await expect(page.getByTestId("settings-trigger")).toBeVisible();
  });

  test("opens drawer on click", async ({ page }) => {
    await page.getByTestId("settings-trigger").click();
    await expect(page.getByTestId("settings-drawer")).toBeVisible();
  });

  test("drawer has AI provider selector", async ({ page }) => {
    await page.getByTestId("settings-trigger").click();
    const providerSelect = page.getByTestId("ai-provider-select");
    await expect(providerSelect).toBeVisible();
    // Check all three providers are available
    const options = providerSelect.locator("option");
    await expect(options).toHaveCount(3);
  });

  test("drawer has API key input", async ({ page }) => {
    await page.getByTestId("settings-trigger").click();
    await expect(page.getByTestId("api-key-input")).toBeVisible();
  });

  test("drawer has word count input", async ({ page }) => {
    await page.getByTestId("settings-trigger").click();
    await expect(page.getByTestId("word-count-input")).toBeVisible();
  });

  test("closes drawer via close button", async ({ page }) => {
    await page.getByTestId("settings-trigger").click();
    await expect(page.getByTestId("settings-drawer")).toBeVisible();
    await page.getByTestId("settings-close").click();
    await expect(page.getByTestId("settings-drawer")).not.toBeVisible();
  });

  test("closes drawer via overlay click", async ({ page }) => {
    await page.getByTestId("settings-trigger").click();
    await expect(page.getByTestId("settings-drawer")).toBeVisible();
    await page.getByTestId("settings-overlay").click({ position: { x: 10, y: 300 } });
    await expect(page.getByTestId("settings-drawer")).not.toBeVisible();
  });
});

test.describe("Test Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/test");
    await waitForHydration(page);
  });

  test("renders test page with HUD and text display", async ({ page }) => {
    await expect(page.getByTestId("test-page")).toBeVisible();
    await expect(page.getByTestId("hud")).toBeVisible();
    await expect(page.getByTestId("text-display")).toBeVisible();
  });

  test("HUD shows WPM, accuracy, streak, and timer", async ({ page }) => {
    await expect(page.getByTestId("hud-wpm")).toBeVisible();
    await expect(page.getByTestId("hud-accuracy")).toBeVisible();
    await expect(page.getByTestId("hud-streak")).toBeVisible();
    await expect(page.getByTestId("hud-timer")).toBeVisible();
  });

  test("keyboard heatmap is rendered with QWERTY keys", async ({ page }) => {
    const heatmap = page.getByTestId("key-heatmap");
    await expect(heatmap).toBeVisible();
    await expect(page.getByTestId("key-q")).toBeVisible();
    await expect(page.getByTestId("key-a")).toBeVisible();
    await expect(page.getByTestId("key-z")).toBeVisible();
  });

  test("first character has current state", async ({ page }) => {
    const firstChar = page.getByTestId("char-0");
    await expect(firstChar).toHaveAttribute("data-state", "current");
  });

  test("typing correct character marks it green", async ({ page }) => {
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "current");
    await page.keyboard.type("T");
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "correct");
    await expect(page.getByTestId("char-1")).toHaveAttribute("data-state", "current");
  });

  test("typing wrong character marks it red", async ({ page }) => {
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "current");
    await page.keyboard.type("x");
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "error");
  });

  test("WPM updates after typing", async ({ page }) => {
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "current");
    await page.keyboard.type("The q");
    const wpmEl = page.getByTestId("hud-wpm");
    await expect(wpmEl).toBeVisible();
  });

  test("back link navigates to home", async ({ page }) => {
    await page.getByTestId("back-link").click();
    await expect(page).toHaveURL("/");
  });

  test("restart button resets the session", async ({ page }) => {
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "current");
    await page.keyboard.type("T");
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "correct");
    await page.getByTestId("restart-btn").click();
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "current");
  });
});

test.describe("Practice Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/practice");
    await waitForHydration(page);
  });

  test("renders practice page", async ({ page }) => {
    await expect(page.getByTestId("practice-page")).toBeVisible();
  });

  test("loads fallback text when no API key is set", async ({ page }) => {
    await expect(page.getByTestId("text-display")).toBeVisible({ timeout: 5000 });
  });

  test("has generate new drill button", async ({ page }) => {
    await expect(page.getByTestId("generate-btn")).toBeVisible({ timeout: 5000 });
  });

  test("has back link to home", async ({ page }) => {
    await expect(page.getByTestId("back-link")).toBeVisible();
  });

  test("keyboard heatmap is visible", async ({ page }) => {
    await expect(page.getByTestId("key-heatmap")).toBeVisible();
  });
});

test.describe("Free Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/free");
    await waitForHydration(page);
  });

  test("renders free page with textarea", async ({ page }) => {
    await expect(page.getByTestId("free-page")).toBeVisible();
    await expect(page.getByTestId("free-textarea")).toBeVisible();
  });

  test("start button is disabled when textarea is empty", async ({ page }) => {
    const btn = page.getByTestId("free-start-btn");
    await expect(btn).toBeDisabled();
  });

  test("start button enables when text is entered", async ({ page }) => {
    await page.getByTestId("free-textarea").fill("Hello world test text");
    const btn = page.getByTestId("free-start-btn");
    await expect(btn).toBeEnabled();
  });

  test("submitting text starts a typing session", async ({ page }) => {
    await page.getByTestId("free-textarea").fill("Hello world");
    await page.getByTestId("free-start-btn").click();
    await expect(page.getByTestId("free-textarea")).not.toBeVisible();
    await expect(page.getByTestId("text-display")).toBeVisible();
  });

  test("can type submitted text and characters update", async ({ page }) => {
    await page.getByTestId("free-textarea").fill("Hi");
    await page.getByTestId("free-start-btn").click();
    await expect(page.getByTestId("text-display")).toBeVisible();

    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "current");
    await page.keyboard.type("H");
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "correct");
    await expect(page.getByTestId("char-1")).toHaveAttribute("data-state", "current");
  });
});

test.describe("Results Modal", () => {
  test("appears when session finishes in free mode", async ({ page }) => {
    await startFreeSession(page, "AB");
    await page.keyboard.type("AB");
    await expect(page.getByTestId("results-modal")).toBeVisible({ timeout: 3000 });
  });

  test("shows WPM, accuracy, time, and characters metrics", async ({ page }) => {
    await startFreeSession(page, "AB");
    await page.keyboard.type("AB");
    await expect(page.getByTestId("results-modal")).toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId("result-wpm")).toBeVisible();
    await expect(page.getByTestId("result-accuracy")).toBeVisible();
    await expect(page.getByTestId("result-time")).toBeVisible();
    await expect(page.getByTestId("result-chars")).toBeVisible();
  });

  test("has AI Drill, Retry, and New Session buttons", async ({ page }) => {
    await startFreeSession(page, "AB");
    await page.keyboard.type("AB");
    await expect(page.getByTestId("results-modal")).toBeVisible({ timeout: 3000 });
    await expect(page.getByTestId("btn-drill")).toBeVisible();
    await expect(page.getByTestId("btn-retry")).toBeVisible();
    await expect(page.getByTestId("btn-new-session")).toBeVisible();
  });

  test("New Session button navigates to home", async ({ page }) => {
    await startFreeSession(page, "AB");
    await page.keyboard.type("AB");
    await expect(page.getByTestId("results-modal")).toBeVisible({ timeout: 3000 });
    await page.getByTestId("btn-new-session").click();
    await expect(page).toHaveURL("/");
  });

  test("Retry button restarts the same text", async ({ page }) => {
    await startFreeSession(page, "AB");
    await page.keyboard.type("AB");
    await expect(page.getByTestId("results-modal")).toBeVisible({ timeout: 3000 });
    await page.getByTestId("btn-retry").click();
    await expect(page.getByTestId("results-modal")).not.toBeVisible();
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "current");
  });
});

test.describe("Duration Picker", () => {
  test("selecting 30s duration updates the test mode", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await page.getByTestId("duration-30").click();
    await page.getByTestId("mode-test").click();
    await expect(page).toHaveURL(/\/test/);
    await expect(page.getByRole("heading", { name: /30s/ })).toBeVisible();
  });

  test("custom duration input works", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await page.getByTestId("duration-custom").fill("45");
    await page.getByTestId("mode-test").click();
    await expect(page).toHaveURL(/\/test/);
    await expect(page.getByRole("heading", { name: /45s/ })).toBeVisible();
  });
});

test.describe("Typing Flow — streak and accuracy", () => {
  test("streak increments on consecutive correct keys", async ({ page }) => {
    await startFreeSession(page, "Hello");
    await page.keyboard.type("Hel");
    await expect(page.getByTestId("hud-streak")).toContainText("3");
  });

  test("streak resets on error", async ({ page }) => {
    await startFreeSession(page, "Hello");
    await page.keyboard.type("He");
    await page.keyboard.type("x");
    await expect(page.getByTestId("hud-streak")).toContainText("0");
  });

  test("accuracy reflects correct/total ratio", async ({ page }) => {
    await startFreeSession(page, "Hi!!");
    await page.keyboard.type("Hi");
    await page.keyboard.type("x"); // wrong
    await expect(page.getByTestId("hud-accuracy")).toContainText("66.67%");
  });
});

test.describe("Backspace support", () => {
  test("backspace moves cursor back and resets char to current", async ({ page }) => {
    await startFreeSession(page, "Hello");
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "current");

    await page.keyboard.type("H");
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "correct");
    await expect(page.getByTestId("char-1")).toHaveAttribute("data-state", "current");

    await page.keyboard.press("Backspace");
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "current");
    await expect(page.getByTestId("char-1")).toHaveAttribute("data-state", "pending");
  });

  test("backspace allows fixing an error", async ({ page }) => {
    await startFreeSession(page, "Hi");

    await page.keyboard.type("x"); // wrong
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "error");

    await page.keyboard.press("Backspace");
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "current");

    await page.keyboard.type("H");
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "correct");
  });

  test("backspace at position 0 does nothing", async ({ page }) => {
    await startFreeSession(page, "Hi");
    await page.keyboard.press("Backspace");
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "current");
  });

  test("can backspace and retype to complete session correctly", async ({ page }) => {
    await startFreeSession(page, "AB");

    await page.keyboard.type("x"); // wrong
    await page.keyboard.press("Backspace");
    await page.keyboard.type("AB"); // correct

    await expect(page.getByTestId("results-modal")).toBeVisible({ timeout: 3000 });
  });
});

test.describe("Max 3 consecutive errors", () => {
  test("blocks typing after 3 wrong characters in a row", async ({ page }) => {
    await startFreeSession(page, "ABCDEF");

    // Type 3 wrong chars
    await page.keyboard.type("xxx");
    // char-0, char-1, char-2 should be errors
    await expect(page.getByTestId("char-0")).toHaveAttribute("data-state", "error");
    await expect(page.getByTestId("char-1")).toHaveAttribute("data-state", "error");
    await expect(page.getByTestId("char-2")).toHaveAttribute("data-state", "error");

    // 4th char should be blocked — still current
    await page.keyboard.type("x");
    await expect(page.getByTestId("char-3")).toHaveAttribute("data-state", "current");

    // Warning should be visible
    await expect(page.getByTestId("error-limit-warning")).toBeVisible();
  });

  test("backspace unblocks after hitting error limit", async ({ page }) => {
    await startFreeSession(page, "ABCDEF");

    // Type 3 wrong chars to get blocked
    await page.keyboard.type("xxx");
    await expect(page.getByTestId("error-limit-warning")).toBeVisible();

    // Backspace once — should unblock
    await page.keyboard.press("Backspace");
    await expect(page.getByTestId("error-limit-warning")).not.toBeVisible();

    // Should be able to type again (still wrong position, but typing works)
    await page.keyboard.type("x");
    await expect(page.getByTestId("char-2")).toHaveAttribute("data-state", "error");
  });

  test("correct chars reset consecutive error count", async ({ page }) => {
    await startFreeSession(page, "ABCD");

    // Type 2 wrong, then correct (A at position means wrong, wrong, then correct at pos 2)
    await page.keyboard.type("xx"); // 2 errors
    await page.keyboard.type("C"); // correct at pos 2
    // Error count should reset — we can still type
    await page.keyboard.type("x"); // wrong at pos 3 — only 1 consecutive error
    await expect(page.getByTestId("char-3")).toHaveAttribute("data-state", "error");
  });
});

test.describe("Keyboard active key highlight", () => {
  test("key lights up on the heatmap when pressed", async ({ page }) => {
    await startFreeSession(page, "Hello");

    // Press and hold "h"
    await page.keyboard.down("h");
    // The "h" key should have active state
    await expect(page.getByTestId("key-h")).toHaveAttribute("data-active", "true");

    await page.keyboard.up("h");
    // After release, active should be gone
    await expect(page.getByTestId("key-h")).not.toHaveAttribute("data-active");
  });
});
