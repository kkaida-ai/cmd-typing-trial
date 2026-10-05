import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "e2e",
  // 手元では入っている Google Chrome を使う。CI では npx playwright install で入れた Chromium を使う
  use: { baseURL: "http://localhost:5173", channel: process.env.CI ? undefined : "chrome" },
  webServer: { command: "npx vite --port 5173 --strictPort", url: "http://localhost:5173", reuseExistingServer: !process.env.CI },
});
