import { expect, test } from "@playwright/test";

test("loads chat workspace and model selector", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Techaboo AI Chat");
  await expect(page.getByRole("combobox", { name: "Select AI model" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message Techaboo" })).toBeVisible();
});

test("web search toggle is always visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Web Search")).toBeVisible();
  await expect(page.locator("#web-search-toggle")).toBeVisible();
});

test("creates conversation and renders chat result", async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "Message Techaboo" });
  await input.fill("Test browser flow");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Test browser flow")).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".assistant-message").last()).toBeVisible({ timeout: 15000 });
});
