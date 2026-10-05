/// <reference types="vitest/config" />
import { defineConfig } from "vite";
// GitHub Pages では https://<user>.github.io/cmd-typing/ に置かれるので base を合わせる
export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/cmd-typing/" : "/",
  test: { include: ["tests/**/*.test.ts"] },
});
