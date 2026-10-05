import { expect, test } from "@playwright/test";

// 人間と同じようにブラウザで遊んで確かめる
test("出題されたコマンドを打つとスコアが1になる", async ({ page }) => {
  await page.goto("/");
  const word = await page.getByTestId("prompt").textContent();
  await page.getByTestId("answer").fill(word!);
  await page.getByTestId("answer").press("Enter");
  await expect(page.getByTestId("score")).toHaveText("1");
  await page.screenshot({ path: "e2e-screenshot.png" });
});
