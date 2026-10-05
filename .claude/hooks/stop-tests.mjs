// Stop: ユニットテストが通るまで作業を終わらせない（無限ループを避けるため2回目以降は通す）
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const input = JSON.parse(readFileSync(0, "utf8"));
if (input.stop_hook_active) process.exit(0);

const r = spawnSync("npm", ["test", "--silent"], { cwd: input.cwd, encoding: "utf8" });
if (r.status !== 0) {
  const tail = (r.stdout + r.stderr).split("\n").slice(-20).join("\n");
  console.log(JSON.stringify({
    decision: "block",
    reason: `npm test が失敗しています。直してから終えてください。直せないなら「未完了」と理由を報告してください。\n${tail}`,
  }));
}
process.exit(0);
