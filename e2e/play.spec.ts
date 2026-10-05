import { expect, test, type Page } from "@playwright/test";

// 人間と同じようにブラウザで遊んで確かめる
test("出題されたコマンドを打つとスコアが1になる", async ({ page }) => {
  await page.goto("/");
  const word = await page.getByTestId("prompt").textContent();
  await page.getByTestId("answer").fill(word!);
  await page.getByTestId("answer").press("Enter");
  await expect(page.getByTestId("score")).toHaveText("1");
  await page.screenshot({ path: "e2e-screenshot.png" });
});

async function typeCurrent(page: Page) {
  const word = await page.getByTestId("prompt").textContent();
  await page.getByTestId("answer").pressSequentially(word!);
  await page.getByTestId("answer").press("Enter");
}

test("連続で正解するとコンボが増え、ミスで 0 に戻る", async ({ page }) => {
  await page.goto("/");
  await typeCurrent(page);
  await typeCurrent(page);
  await expect(page.getByTestId("combo")).toHaveText("2");
  await page.getByTestId("answer").fill("zzz");
  await page.getByTestId("answer").press("Enter");
  await expect(page.getByTestId("combo")).toHaveText("0");
});

test("最初の1文字を打つまでタイマーは動かず、60 秒で終了する", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await page.clock.runFor(10_000);
  await expect(page.getByTestId("time")).toHaveText("60");

  await typeCurrent(page);
  await page.clock.runFor(30_000);
  await expect(page.getByTestId("time")).toHaveText("30");

  await page.clock.runFor(30_000);
  await expect(page.getByTestId("time")).toHaveText("0");
  await expect(page.getByTestId("answer")).toBeDisabled();
  await expect(page.getByTestId("result")).toBeVisible();
  await expect(page.getByTestId("result")).toContainText("スコア 1");
});

test("「もう一度」でスコアと時間がリセットされる", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await typeCurrent(page);
  await page.clock.runFor(60_000);
  await page.getByTestId("retry").click();
  await expect(page.getByTestId("score")).toHaveText("0");
  await expect(page.getByTestId("combo")).toHaveText("0");
  await expect(page.getByTestId("time")).toHaveText("60");
  await expect(page.getByTestId("answer")).toBeEnabled();
  await expect(page.getByTestId("result")).toBeHidden();
});
