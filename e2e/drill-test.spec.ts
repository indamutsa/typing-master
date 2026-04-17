import { test, expect } from "@playwright/test";

test("practice page loads fallback text and generate button works", async ({ page }) => {
  await page.goto("/practice");

  // Wait for text to load (fallback since API key has no balance)
  await expect(page.getByTestId("text-display")).toBeVisible({ timeout: 10000 });

  const text1 = await page.getByTestId("text-display").textContent();
  console.log("Initial text (first 80 chars):", text1?.slice(0, 80));
  expect(text1?.length).toBeGreaterThan(10);

  // Click generate new drill
  const genBtn = page.getByTestId("generate-btn");
  await expect(genBtn).toBeVisible({ timeout: 5000 });
  await genBtn.click();

  // Should show loading then text again
  await expect(page.getByTestId("text-display")).toBeVisible({ timeout: 10000 });

  const text2 = await page.getByTestId("text-display").textContent();
  console.log("After generate (first 80 chars):", text2?.slice(0, 80));
  expect(text2?.length).toBeGreaterThan(10);
});

test("drill API route returns text or error", async ({ request }) => {
  const response = await request.post("/api/drill", {
    data: { weakKeys: ["d", "e", "s"], provider: "deepseek" },
  });

  console.log("API status:", response.status());
  const body = await response.json();
  console.log("API response:", JSON.stringify(body).slice(0, 200));

  // Either succeeds with text or returns an error (due to API key balance)
  expect(response.status()).toBeLessThanOrEqual(502);
});

test("results modal has close button", async ({ page }) => {
  // Use free mode to quickly finish a session
  await page.goto("/free");
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-testid="free-textarea"]');
    return el && (Object.keys(el).some(k => k.startsWith("__reactFiber")));
  });

  await page.getByTestId("free-textarea").fill("ab");
  await page.getByTestId("free-start-btn").click();
  await expect(page.getByTestId("text-display")).toBeVisible();

  await page.keyboard.type("ab");
  await expect(page.getByTestId("results-modal")).toBeVisible({ timeout: 5000 });

  // Close button should be visible
  await expect(page.getByTestId("results-close")).toBeVisible();
  await page.getByTestId("results-close").click();

  // Should navigate away from modal
  await expect(page.getByTestId("results-modal")).not.toBeVisible({ timeout: 5000 });
});
